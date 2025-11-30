import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    // For future Google OAuth integration
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Security fields
    refreshTokens: [{
      token: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      userAgent: String,
      ipAddress: String,
    }],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ===================
// Indexes
// ===================
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// ===================
// Virtual for account lock status
// ===================
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ===================
// Pre-save middleware - Hash password
// ===================
userSchema.pre('save', async function () {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) return;

  // Generate salt with cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Update passwordChangedAt for existing users
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for JWT timing
  }
});

// ===================
// Instance Methods
// ===================

/**
 * Compare provided password with stored hash
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if password was changed after JWT was issued
 */
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Handle failed login attempt
 */
userSchema.methods.handleFailedLogin = async function () {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;

    // Lock account if max attempts reached
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }
  }

  await this.save({ validateBeforeSave: false });
};

/**
 * Reset login attempts on successful login
 */
userSchema.methods.handleSuccessfulLogin = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

/**
 * Add refresh token
 */
userSchema.methods.addRefreshToken = async function (token, expiresAt, userAgent, ipAddress) {
  // Remove expired tokens
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );

  // Limit to 5 active sessions per user
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Remove oldest
  }

  this.refreshTokens.push({
    token,
    expiresAt,
    userAgent,
    ipAddress,
  });

  await this.save({ validateBeforeSave: false });
};

/**
 * Remove refresh token
 */
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  await this.save({ validateBeforeSave: false });
};

/**
 * Remove all refresh tokens (logout from all devices)
 */
userSchema.methods.removeAllRefreshTokens = async function () {
  this.refreshTokens = [];
  await this.save({ validateBeforeSave: false });
};

// ===================
// Static Methods
// ===================

/**
 * Find user by email with password included
 */
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    return null;
  }

  // Check if account is locked
  if (user.isLocked) {
    const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    throw new Error(`Account is locked. Try again in ${lockMinutes} minutes.`);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.handleFailedLogin();
    return null;
  }

  await user.handleSuccessfulLogin();
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;


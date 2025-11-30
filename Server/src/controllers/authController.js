import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// ===================
// Token Configuration
// ===================
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived for security
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived for convenience
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate JWT Access Token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Get client info for token storage
 */
const getClientInfo = (req) => ({
  userAgent: req.headers['user-agent'] || 'unknown',
  ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
});

/**
 * Set refresh token cookie
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: '/api/auth/refresh',
  });
};

/**
 * Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh',
  });
};

// ===================
// Default Avatar Generator
// ===================

/**
 * Generate a cool default avatar using DiceBear API
 * @param {string} seed - Unique seed (email or name)
 * @returns {string} Avatar URL
 */
const generateDefaultAvatar = (seed) => {
  // Available DiceBear styles that look professional and cool
  const styles = [
    'avataaars',     // Customizable cartoon avatars
    'bottts',        // Cool robots
    'fun-emoji',     // Fun emoji faces
    'lorelei',       // Elegant illustrations
    'micah',         // Modern illustrated
    'notionists',    // Notion-style avatars
    'thumbs',        // Cute thumbs up characters
    'big-smile',     // Happy smiling faces
    'personas',      // Professional avatars
  ];

  // Pick a random style for variety
  const style = styles[Math.floor(Math.random() * styles.length)];

  // Encode the seed for URL safety
  const encodedSeed = encodeURIComponent(seed);

  // Generate avatar with sktch.ai brand colors (indigo/purple theme)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}&backgroundColor=6366f1,8b5cf6,a855f7,ec4899&backgroundType=gradientLinear`;
};

// ===================
// Controller Functions
// ===================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Generate a cool default avatar
    const defaultAvatar = generateDefaultAvatar(email);

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: defaultAvatar,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    // Store refresh token
    const clientInfo = getClientInfo(req);
    await user.addRefreshToken(
      refreshToken,
      expiresAt,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    console.log(`[Auth] New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken, // Also send in body for non-cookie clients
        expiresIn: 900, // 15 minutes in seconds
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        message: 'An account with this email already exists.',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const { email, password } = req.body;

    // Find user and verify password
    let user;
    try {
      user = await User.findByCredentials(email.toLowerCase(), password);
    } catch (error) {
      // Account is locked
      return res.status(423).json({
        success: false,
        error: 'Account locked',
        message: error.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    // Store refresh token
    const clientInfo = getClientInfo(req);
    await user.addRefreshToken(
      refreshToken,
      expiresAt,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    console.log(`[Auth] User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.',
    });
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        message: 'Please provide a refresh token',
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': token,
      'refreshTokens.expiresAt': { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      // Clear potentially invalid cookie
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Your session has expired. Please log in again.',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    // Remove old refresh token
    await user.removeRefreshToken(token);

    // Generate new tokens (token rotation for security)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    // Store new refresh token
    const clientInfo = getClientInfo(req);
    await user.addRefreshToken(
      newRefreshToken,
      expiresAt,
      clientInfo.userAgent,
      clientInfo.ipAddress
    );

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    console.error('[Auth] Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing your session.',
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (token && req.user) {
      await req.user.removeRefreshToken(token);
    }

    // Clear cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: 'An error occurred during logout.',
    });
  }
};

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
export const logoutAll = async (req, res) => {
  try {
    await req.user.removeAllRefreshTokens();

    // Clear cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('[Auth] Logout all error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: 'An error occurred during logout.',
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account no longer exists',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('[Auth] Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: 'An error occurred while fetching your profile.',
    });
  }
};

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
export const updateMe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    // Handle avatar: empty string means remove, otherwise set the URL
    if (avatar !== undefined) {
      updates.avatar = avatar === '' ? null : avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('[Auth] Update me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: 'An error occurred while updating your profile.',
    });
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens except current session
    const currentToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (currentToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token === currentToken
      );
      await user.save({ validateBeforeSave: false });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('[Auth] Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      message: 'An error occurred while changing your password.',
    });
  }
};

/**
 * @route   GET /api/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const sessions = user.refreshTokens
      .filter((rt) => rt.expiresAt > new Date())
      .map((rt) => ({
        id: rt._id,
        userAgent: rt.userAgent,
        ipAddress: rt.ipAddress,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
      }));

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
      },
    });
  } catch (error) {
    console.error('[Auth] Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
    });
  }
};


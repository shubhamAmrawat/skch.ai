import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

// ===================
// Token Configuration
// ===================
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
 * Generate default avatar using DiceBear API
 */
const generateDefaultAvatar = (seed) => {
  const styles = [
    'avataaars',
    'bottts',
    'fun-emoji',
    'lorelei',
    'micah',
    'notionists',
    'thumbs',
    'big-smile',
    'personas',
  ];

  const style = styles[Math.floor(Math.random() * styles.length)];
  const encodedSeed = encodeURIComponent(seed);

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}&backgroundColor=6366f1,8b5cf6,a855f7,ec4899&backgroundType=gradientLinear`;
};

/**
 * Initialize Google OAuth Client
 */
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

/**
 * Check if token is an access token (not an ID token)
 * Access tokens typically start with 'ya29.' or similar patterns
 * ID tokens are JWTs with 3 segments separated by dots
 */
const isAccessToken = (token) => {
  // Access tokens are usually longer and don't have the JWT structure
  // ID tokens are JWTs: header.payload.signature (3 parts)
  const parts = token.split('.');

  // If it doesn't have exactly 3 parts, it's likely an access token
  if (parts.length !== 3) {
    return true;
  }

  // Access tokens often start with 'ya29.' or similar
  if (token.startsWith('ya29.') || token.startsWith('1//')) {
    return true;
  }

  // If it has 3 parts, try to decode the first part to see if it's a JWT header
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    // If it has 'alg' and 'typ', it's likely a JWT (ID token)
    return !(header.alg && header.typ);
  } catch {
    // If we can't decode it, assume it's an access token
    return true;
  }
};

/**
 * Verify Google ID Token
 */
const verifyGoogleIdToken = async (idToken) => {
  try {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    // Only log if it's not a format error (expected for access tokens)
    if (!error.message.includes('Wrong number of segments')) {
      console.error('[Google Auth] ID Token verification error:', error);
    }
    throw new Error('Invalid Google ID token');
  }
};

/**
 * Verify Google Access Token by fetching user info
 */
const verifyGoogleAccessToken = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify access token');
    }

    const userInfo = await response.json();

    return {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      emailVerified: userInfo.email_verified === true,
    };
  } catch (error) {
    console.error('[Google Auth] Access Token verification error:', error);
    throw new Error('Invalid Google access token');
  }
};

/**
 * Verify Google Token (supports both ID tokens and access tokens)
 */
const verifyGoogleToken = async (token) => {
  // Detect token type to avoid unnecessary verification attempts
  if (isAccessToken(token)) {
    // It's an access token, verify it directly
    return await verifyGoogleAccessToken(token);
  } else {
    // It looks like an ID token, try to verify it
    try {
      return await verifyGoogleIdToken(token);
    } catch (idTokenError) {
      // If ID token verification fails, fall back to access token verification
      // (in case our detection was wrong)
      try {
        return await verifyGoogleAccessToken(token);
      } catch (accessTokenError) {
        throw new Error('Invalid Google token');
      }
    }
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 * @note    Accepts both ID tokens and access tokens
 */
export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken: googleAccessToken } = req.body;
    const token = idToken || googleAccessToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing token',
        message: 'Google token (ID token or access token) is required',
      });
    }

    // Verify Google token (supports both ID tokens and access tokens)
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email not verified',
        message: 'Your Google email is not verified. Please verify it with Google first.',
      });
    }

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId: googleUser.googleId });

    if (user) {
      // User exists with Google OAuth
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Update user info if changed
      if (user.email !== googleUser.email.toLowerCase()) {
        user.email = googleUser.email.toLowerCase();
      }
      if (googleUser.name && user.name !== googleUser.name) {
        user.name = googleUser.name;
      }
      if (googleUser.picture && user.avatar !== googleUser.picture) {
        user.avatar = googleUser.picture;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check if user exists with same email (local account)
      const existingUser = await User.findOne({ email: googleUser.email.toLowerCase() });

      if (existingUser) {
        // Link Google account to existing local account
        if (existingUser.googleId) {
          return res.status(409).json({
            success: false,
            error: 'Account conflict',
            message: 'An account with this email already exists with a different Google account.',
          });
        }

        // Link Google OAuth to existing account
        existingUser.googleId = googleUser.googleId;
        existingUser.authProvider = 'google';
        if (googleUser.picture) {
          existingUser.avatar = googleUser.picture;
        }
        existingUser.isEmailVerified = true; // Google emails are verified
        existingUser.lastLogin = new Date();
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user with Google OAuth
        user = new User({
          name: googleUser.name || 'Google User',
          email: googleUser.email.toLowerCase(),
          googleId: googleUser.googleId,
          authProvider: 'google',
          avatar: googleUser.picture || generateDefaultAvatar(googleUser.email),
          isEmailVerified: true, // Google emails are verified
          password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
          lastLogin: new Date(),
        });

        await user.save();
        console.log(`[Google Auth] New user registered: ${user.email}`);
      }
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

    console.log(`[Google Auth] User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Google authentication successful',
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
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      },
    });
  } catch (error) {
    console.error('[Google Auth] Error:', error);

    if (error.message === 'Invalid Google token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The Google token is invalid or expired. Please try again.',
      });
    }

    if (error.message.includes('GOOGLE_CLIENT_ID')) {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'Google OAuth is not properly configured on the server.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during Google authentication. Please try again.',
    });
  }
};


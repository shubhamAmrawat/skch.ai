import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import logger from './logger.js';
/**
 * CONCEPT: Rate limiting has two key parameters:
 * - windowMs: the time window (e.g. 15 minutes)
 * - max: max requests allowed in that window
 * 
 * After max is hit, the user gets 429 Too Many Requests
 * until the window resets.
 */

// ================================
// AI Generation — strictest limits
// Most expensive endpoint, protect aggressively
// ================================
export const aiGenerateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour window
  max: 20,                    // 20 generations per hour per IP
  standardHeaders: true,      // sends RateLimit headers in response
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use userId if authenticated, fall back to IP
    // This prevents bypass via multiple IPs
    return req.userId?.toString() || ipKeyGenerator(req);
  },
  handler: (req, res) => {
    logger.warn({ 
      userId: req.userId, 
      ip: req.ip,
      endpoint: '/generate'
    }, 'AI rate limit exceeded');
    
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'You have exceeded the generation limit. Please wait before trying again.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000), // when they can retry
    });
  },
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

// ================================
// General API — moderate limits
// Protects all other routes from abuse
// ================================
export const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 200,                   // 200 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many requests, please slow down.',
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

// ================================
// Auth routes — prevent brute force
// Tightest limits, protects login/register
// ================================
export const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // only 10 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip }, 'Auth brute force attempt detected');
    return res.status(429).json({
      success: false,
      error: 'Too many attempts',
      message: 'Too many login attempts. Please wait 15 minutes.',
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

export const refreshLimit = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many token refresh attempts. Please wait.',
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});
import logger from '../config/logger.js'; 
import {randomBytes} from 'crypto';

/**
 * Request logging middleware
 * 
 * Assigns a unique requestId to every request so you can
 * trace a single request through all your logs.
 * 
 * CONCEPT: Request tracing — if 100 requests hit your server
 * simultaneously, logs from different requests get interleaved.
 * A requestId lets you filter "show me only logs from request X"
 */
export const requestLogger = (req, res, next) => {
  // Generate unique ID for this request
  const requestId = randomBytes(8).toString('hex');
  req.requestId = requestId;

  // Record when request started
  const startTime = Date.now();

  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.userId || null,
  }, 'Incoming request');

  // Hook into response finish event to log completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error'
      : res.statusCode >= 400 ? 'warn'
      : 'info';

    logger[level]({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.userId || null,
    }, `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
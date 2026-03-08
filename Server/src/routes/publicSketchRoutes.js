import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  listPublicSketches,
  getPublicSketch,
  likePublicSketch,
  forkPublicSketch,
} from '../controllers/publicSketchController.js';

const router = Router();

/**
 * @route   GET /api/sketches/public
 * @desc    List public sketches (paginated, search, sort)
 * @access  Public (optional auth for likedByMe)
 * @query   page, limit, q, tags, sort (recent|popular|trending)
 */
router.get('/', optionalAuth, listPublicSketches);

/**
 * @route   GET /api/sketches/public/:id
 * @desc    Get a single public sketch (increments view count)
 * @access  Public (optional auth for likedByMe)
 */
router.get('/:id', optionalAuth, getPublicSketch);

/**
 * @route   POST /api/sketches/public/:id/like
 * @desc    Toggle like on a public sketch
 * @access  Private
 */
router.post('/:id/like', authenticate, likePublicSketch);

/**
 * @route   POST /api/sketches/public/:id/fork
 * @desc    Fork a public sketch (create copy for current user)
 * @access  Private
 */
router.post('/:id/fork', authenticate, forkPublicSketch);

export default router;

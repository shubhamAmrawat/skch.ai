import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSketch,
  listSketches,
  getSketch,
  updateSketch,
  deleteSketch,
} from '../controllers/sketchController.js';

const router = Router();

// All sketch routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/sketches
 * @desc    Create a new sketch
 * @access  Private
 * @body    { title?: string, code: string }
 */
router.post('/', createSketch);

/**
 * @route   GET /api/sketches
 * @desc    List user's sketches (paginated)
 * @access  Private
 * @query   page, limit
 */
router.get('/', listSketches);

/**
 * @route   GET /api/sketches/:id
 * @desc    Get a single sketch
 * @access  Private
 */
router.get('/:id', getSketch);

/**
 * @route   PUT /api/sketches/:id
 * @desc    Update a sketch
 * @access  Private
 * @body    { title?: string, code?: string }
 */
router.put('/:id', updateSketch);

/**
 * @route   DELETE /api/sketches/:id
 * @desc    Delete a sketch
 * @access  Private
 */
router.delete('/:id', deleteSketch);

export default router;

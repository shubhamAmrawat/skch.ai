import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSketch,
  listSketches,
  getSketch,
  getSketchSnapshot,
  updateSketch,
  deleteSketch,
} from '../controllers/sketchController.js';
import { uploadSketchAssets } from '../controllers/assetController.js';

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
 * @route   GET /api/sketches/:sketchId/snapshot
 * @desc    Get sketch snapshot (proxies R2 to avoid CORS)
 * @access  Private
 */
router.get('/:sketchId/snapshot', getSketchSnapshot);

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
 * @route   POST /api/sketches/:sketchId/assets
 * @desc    Upload sketch thumbnail/snapshot to R2
 * @access  Private
 */
router.post('/:sketchId/assets', uploadSketchAssets);

/**
 * @route   DELETE /api/sketches/:id
 * @desc    Delete a sketch
 * @access  Private
 */
router.delete('/:id', deleteSketch);

export default router;

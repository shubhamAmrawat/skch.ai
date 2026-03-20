import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSketch,
  listSketches,
  getSketch,
  getSketchSnapshot,
  updateSketch,
  deleteSketch,
  getSketchStats,
} from '../controllers/sketchController.js';
import { uploadSketchAssets } from '../controllers/assetController.js';
import { createSketchValidation, updateSketchValidation, validateId, validateSketchId } from '../middleware/sketchValidation.js';
import multer from 'multer';

const router = Router();

// All sketch routes require authentication
router.use(authenticate);

router.get('/stats', getSketchStats);
router.post('/',createSketchValidation ,createSketch);

router.get('/', listSketches);

router.get('/:sketchId/snapshot',validateSketchId, getSketchSnapshot);

router.get('/:id', validateId, getSketch);

router.put('/:id', validateId , updateSketchValidation, updateSketch);

// Handle multipart uploads for sketch assets (thumbnail + snapshot).
// We use memoryStorage so the controller can stream the files into R2.
const uploadSketchAssetFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    // Snapshot JSON can get large depending on canvas complexity.
    fileSize: 20 * 1024 * 1024, // 20MB per file
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'snapshot', maxCount: 1 },
]);

router.post('/:sketchId/assets', validateSketchId, uploadSketchAssetFiles, uploadSketchAssets);

router.delete('/:id',validateId, deleteSketch);

export default router;

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
import { createSketchValidation, updateSketchValidation, validateId, validateSketchId } from '../middleware/sketchValidation.js';

const router = Router();

// All sketch routes require authentication
router.use(authenticate);


router.post('/',createSketchValidation ,createSketch);

router.get('/', listSketches);

router.get('/:sketchId/snapshot',validateSketchId, getSketchSnapshot);

router.get('/:id', validateId, getSketch);

router.put('/:id', validateId , updateSketchValidation, updateSketch);

router.post('/:sketchId/assets',validateSketchId, uploadSketchAssets);

router.delete('/:id',validateId, deleteSketch);

export default router;

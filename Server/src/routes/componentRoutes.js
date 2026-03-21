import { Router } from 'express';
import { listComponents, getComponent } from '../controllers/componentController.js';

const router = Router();

// Public — no auth required
router.get('/', listComponents);
router.get('/:id', getComponent);

export default router;
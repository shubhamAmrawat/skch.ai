import { Router } from 'express';
import { generateUI, healthCheck } from '../controllers/aiController.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * @route   POST /api/generate
 * @desc    Generate React/Tailwind code from wireframe image
 * @access  Public (should be protected in production)
 * @body    {
 *            image: string (base64),
 *            history?: array (previous messages),
 *            feedback?: string (for iterations),
 *            currentCode?: string (for iterations)
 *          }
 */
router.post('/generate', generateUI);

export default router;


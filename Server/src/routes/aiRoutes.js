import { Router } from 'express';
import { generateUI, generateUIStream, healthCheck } from '../controllers/aiController.js';

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
 *            currentCode?: string (for iterations),
 *            stream?: boolean (if true, returns SSE stream)
 *          }
 */
router.post('/generate', (req, res) => {
  const useStream = req.body?.stream === true || req.query?.stream === 'true';
  if (useStream) {
    generateUIStream(req, res);
  } else {
    generateUI(req, res);
  }
});

export default router;


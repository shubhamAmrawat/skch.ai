import { Router } from 'express';
import { generateUI, generateUIStream, healthCheck } from '../controllers/aiController.js';
import { aiGenerateLimit } from '../config/rateLimits.js';

const router = Router();

router.get('/health', healthCheck);


router.post('/generate',  aiGenerateLimit,(req, res) => {
  const useStream = req.body?.stream === true || req.query?.stream === 'true';
  if (useStream) {
    generateUIStream(req, res);
  } else {
    generateUI(req, res);
  }
});

export default router;


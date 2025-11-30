import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ===================
// Security Middleware
// ===================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ===================
// CORS Configuration
// ===================
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===================
// Body Parser
// ===================
// Increase limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===================
// Request Logging
// ===================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===================
// API Routes
// ===================
app.use('/api', aiRoutes);

// ===================
// Root Endpoint
// ===================
app.get('/', (req, res) => {
  res.json({
    name: 'Sketch2Code API',
    version: '1.0.0',
    description: 'AI-powered wireframe to React code generation',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/generate'
    }
  });
});

// ===================
// 404 Handler
// ===================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// ===================
// Error Handler
// ===================
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===================
// Start Server
// ===================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎨 Sketch2Code API Server                           ║
║                                                       ║
║   Server:  http://localhost:${PORT}                   ║
║   Health:  http://localhost:${PORT}/api/health        ║
║                                                       ║
║   Allowed Origins:                                    ║
║   ${allowedOrigins.join(', ').padEnd(50)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Warn if API key is not configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn('\n⚠️  WARNING: OPENAI_API_KEY is not set in environment variables!');
    console.warn('   Create a .env file with your API key.\n');
  }
});

export default app;


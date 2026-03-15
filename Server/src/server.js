import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import connectDB from './config/database.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import sketchRoutes from './routes/sketchRoutes.js';
import publicSketchRoutes from './routes/publicSketchRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ===================
// Database Connection
// ===================
connectDB();

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===================
// Body Parser & Cookies
// ===================
// Increase limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(cookieParser());

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
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sketches/public', publicSketchRoutes); // Must be before /api/sketches to avoid :id matching "public"
app.use('/api/sketches', sketchRoutes);

// ===================
// Root Endpoint
// ===================
app.get('/', (req, res) => {
  res.json({
    name: 'sktch.ai API',
    version: '1.0.0',
    description: 'AI-powered wireframe to React code generation',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/generate',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
      },
      upload: {
        avatar: 'POST /api/upload/avatar',
        removeAvatar: 'DELETE /api/upload/avatar',
      },
      sketches: {
        create: 'POST /api/sketches',
        list: 'GET /api/sketches',
        get: 'GET /api/sketches/:id',
        update: 'PUT /api/sketches/:id',
        delete: 'DELETE /api/sketches/:id',
      }
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
║   🎨 sktch.ai API Server                              ║
║                                                       ║
║   Server:  http://localhost:${PORT}                      ║
║   Health:  http://localhost:${PORT}/api/health           ║
║                                                       ║
║   Allowed Origins:                                    ║
║   ${allowedOrigins.join(', ').padEnd(50)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Warn if essential env vars are not configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn('\n⚠️  WARNING: OPENAI_API_KEY is not set in environment variables!');
  }

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set. Using default (unsafe for production)!');
  }

  if (!process.env.DB_URI) {
    console.warn('⚠️  WARNING: DB_URI is not set. Database connection will fail!');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  WARNING: Cloudinary credentials not fully configured. Avatar upload will fail!');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  WARNING: SMTP not configured. Forgot password (OTP emails) will fail!');
    console.warn('   Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env. For Gmail: smtp.gmail.com + App Password.');
  }
});

export default app;

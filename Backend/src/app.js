import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import githubRoutes from './routes/github.js';
import testCaseRoutes from './routes/testCases.js';

// Import middleware
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticateToken } from './middlewares/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for cloud deployments (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Rate limiting with proxy support
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use X-Forwarded-For header when behind a proxy
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  }
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration with environment detection
const getCorsOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://intern-task-nu7c.vercel.app', // Production frontend
  ];

  // Add custom frontend URLs from environment
  if (process.env.FRONTEND_URL) {
    const customUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim()).filter(Boolean);
    origins.push(...customUrls);
  }

  // Add production URLs explicitly if not already included
  if (process.env.PRODUCTION_FRONTEND_URL && !origins.includes(process.env.PRODUCTION_FRONTEND_URL)) {
    origins.push(process.env.PRODUCTION_FRONTEND_URL);
  }

  // Remove duplicates and filter out empty strings
  return [...new Set(origins)].filter(Boolean);
};

app.use(cors({
  origin: getCorsOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  exposedHeaders: ['set-cookie']
}));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const corsOrigins = getCorsOrigins();
  res.status(200).json({ 
    status: 'OK', 
    message: 'Test Case Generator API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    backend: {
      url: process.env.BACKEND_URL || 'http://localhost:5000',
      port: process.env.PORT || 5000
    },
    cors: {
      allowedOrigins: corsOrigins,
      credentials: true
    },
    services: {
      github: !!process.env.GITHUB_CLIENT_ID,
      jwt: !!process.env.JWT_SECRET,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GOOGLE_GEMINI_API_KEY
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', authenticateToken, githubRoutes);
app.use('/api/test-cases', authenticateToken, testCaseRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  const corsOrigins = getCorsOrigins();
  console.log(`🚀 Test Case Generator Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || 'http://localhost:5000'}`);
  console.log(`🌐 CORS Origins (${corsOrigins.length}):`);
  corsOrigins.forEach((origin, index) => {
    console.log(`   ${index + 1}. ${origin}`);
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📋 Environment Configuration:`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - PORT: ${PORT}`);
    console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   - GITHUB_CLIENT_ID: ${process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - GITHUB_CLIENT_SECRET: ${process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  }
});

export default app; 
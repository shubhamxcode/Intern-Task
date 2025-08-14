import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate AI API key (at least one should be present)
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;

if (!hasOpenAI && !hasGemini) {
  console.error('❌ At least one AI API key is required (OPENAI_API_KEY or GOOGLE_GEMINI_API_KEY)');
  process.exit(1);
}

// Dynamic environment configuration
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.NODE_ENV === 'production') return process.env.PRODUCTION_BACKEND_URL || 'https://intern-task-65q2.onrender.com';
  return 'http://localhost:5000';
};

const getFrontendUrls = () => {
  const urls = new Set([
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://intern-task-nu7c.vercel.app'
  ]);

  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(',').forEach(url => urls.add(url.trim()));
  }

  if (process.env.PRODUCTION_FRONTEND_URL) {
    urls.add(process.env.PRODUCTION_FRONTEND_URL);
  }
  
  if (process.env.LOCAL_FRONTEND_URL) {
    urls.add(process.env.LOCAL_FRONTEND_URL);
  }

  return Array.from(urls).filter(Boolean);
};

const getPrimaryFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PRODUCTION_FRONTEND_URL || 'https://intern-task-nu7c.vercel.app';
  }
  return process.env.LOCAL_FRONTEND_URL || 'http://localhost:3000';
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('⚙️  Backend Configuration:', {
    backendUrl: getBackendUrl(),
    primaryFrontendUrl: getPrimaryFrontendUrl(),
    allFrontendUrls: getFrontendUrls(),
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || 5000
  });
}

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  backendUrl: getBackendUrl(),
  frontendUrl: getPrimaryFrontendUrl(),

  // Parse multiple frontend URLs for CORS
  frontendUrls: getFrontendUrls(),

  // GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
    oauthUrl: 'https://github.com/login/oauth',
    redirectUri: `${getPrimaryFrontendUrl()}/auth/github/callback`
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },

  // AI APIs
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1'
    },
    gemini: {
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1'
    }
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  }
};

export default config; 
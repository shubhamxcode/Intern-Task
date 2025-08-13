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

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
    oauthUrl: 'https://github.com/login/oauth',
    redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/github/callback`
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
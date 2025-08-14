# 🚀 Complete Setup Guide - Test Case Generator

This guide will help you set up the project for both **localhost development** and **production deployment**.

## 📋 Overview

- **Frontend**: React/TypeScript deployed on Vercel → https://intern-task-nu7c.vercel.app/
- **Backend**: Node.js/Express deployed on Render → https://intern-task-65q2.onrender.com
- **Features**: Automatic environment detection, dual URL support, GitHub OAuth integration

---

## 🏠 Local Development Setup

### 1. Backend Setup (Backend/.env)

Create `Backend/.env` file:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URLs for CORS (supports multiple)
FRONTEND_URL=http://localhost:3000,http://localhost:5173,http://localhost:5174,https://intern-task-nu7c.vercel.app

# Backend URL
BACKEND_URL=http://localhost:5000

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_API_URL=https://api.github.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# AI API Keys (at least one required)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_AI_PROVIDER=openai

# Development Settings
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
TRUST_PROXY=false
```

### 2. Frontend Setup (Frontend/.env)

Create `Frontend/.env` file:

```bash
# API Configuration - Automatically detects environment
VITE_API_BASE_URL=http://localhost:5000/api

# GitHub OAuth Callback
VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Application Configuration
VITE_APP_NAME=Test Case Generator
VITE_APP_VERSION=1.0.0

# Production URLs (for auto-fallback)
VITE_PRODUCTION_BACKEND_URL=https://intern-task-65q2.onrender.com
VITE_PRODUCTION_FRONTEND_URL=https://intern-task-nu7c.vercel.app

# Local URLs
VITE_LOCAL_BACKEND_URL=http://localhost:5000
VITE_LOCAL_FRONTEND_URL=http://localhost:3000

# Development Settings
VITE_DEBUG_MODE=true
VITE_API_TIMEOUT=30000
```

### 3. GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create new OAuth App:
   - **Application name**: Test Case Generator
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Copy `Client ID` and `Client Secret` to your Backend `.env` file

### 4. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Get AI API Keys

- **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google Gemini**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 6. Start Development Servers

```bash
# Start Backend (terminal 1)
cd Backend
npm install
npm run dev

# Start Frontend (terminal 2)  
cd Frontend
npm install
npm run dev
```

### 7. Test Local Setup

- Backend Health: http://localhost:5000/health
- Frontend: http://localhost:3000
- Test GitHub login flow

---

## 🌐 Production Deployment

### Backend (Render) Environment Variables

Update your Render app environment variables:

```bash
NODE_ENV=production
BACKEND_URL=https://intern-task-65q2.onrender.com
FRONTEND_URL=https://intern-task-nu7c.vercel.app,http://localhost:3000

# Same GitHub, JWT, and AI keys as local
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Production Settings
LOG_LEVEL=warn
TRUST_PROXY=true
```

### Frontend (Vercel) Environment Variables

Update your Vercel app environment variables:

```bash
VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
VITE_GITHUB_OAUTH_CALLBACK_URL=https://intern-task-nu7c.vercel.app/auth/github/callback
VITE_APP_NAME=Test Case Generator
VITE_PRODUCTION_BACKEND_URL=https://intern-task-65q2.onrender.com
VITE_PRODUCTION_FRONTEND_URL=https://intern-task-nu7c.vercel.app
VITE_DEBUG_MODE=false
```

### Update GitHub OAuth App

Add production callback URL to your GitHub OAuth app:
- **Authorization callback URL**: `https://intern-task-nu7c.vercel.app/auth/github/callback`

---

## 🔄 Automatic Environment Detection

The app now automatically detects the environment and switches between localhost and production URLs:

### Frontend Logic:
- **Development**: Uses `localhost:5000/api`
- **Production**: Uses `https://intern-task-65q2.onrender.com/api`
- **Auto-detection**: Based on hostname (vercel.app, localhost, etc.)

### Backend Logic:
- **CORS**: Automatically includes both localhost and production URLs
- **OAuth**: Dynamically sets callback URLs based on environment
- **Health Check**: Shows current configuration at `/health`

---

## 🧪 Testing & Debugging

### Test Connectivity

```bash
# Test local backend
curl http://localhost:5000/health

# Test production backend
curl https://intern-task-65q2.onrender.com/health

# Test CORS from frontend
fetch('http://localhost:5000/health').then(r => r.json()).then(console.log)
```

### Debug Environment

The app includes extensive logging:

- **Frontend**: Check browser console for API configuration
- **Backend**: Check server logs for CORS origins and environment config
- **Health Endpoint**: Visit `/health` for complete status information

### Common Issues

1. **CORS Errors**: 
   - Check `FRONTEND_URL` includes your frontend domain
   - Verify production URLs are added to environment variables

2. **OAuth Errors**:
   - Verify GitHub app has correct callback URLs
   - Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

3. **API Connection Errors**:
   - Verify backend is running and accessible
   - Check `VITE_API_BASE_URL` points to correct backend

4. **Environment Detection Issues**:
   - Clear browser cache and localStorage
   - Check environment variables are properly set

---

## 📊 Environment Status

### Current URLs:
- **Production Frontend**: https://intern-task-nu7c.vercel.app/
- **Production Backend**: https://intern-task-65q2.onrender.com
- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:5000

### Health Checks:
- **Local**: http://localhost:5000/health
- **Production**: https://intern-task-65q2.onrender.com/health

---

## 🔧 Advanced Configuration

### Multiple Frontend URLs

The backend supports multiple frontend URLs for CORS:

```bash
FRONTEND_URL=http://localhost:3000,http://localhost:5173,https://intern-task-nu7c.vercel.app,https://custom-domain.com
```

### Custom Environment Detection

You can override auto-detection by setting explicit URLs:

```bash
# Frontend
VITE_API_BASE_URL=https://your-custom-backend.com/api

# Backend  
BACKEND_URL=https://your-custom-backend.com
```

### Debug Mode

Enable debug mode for additional logging:

```bash
# Frontend
VITE_DEBUG_MODE=true

# Backend
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

---

## 📞 Support

If you encounter issues:

1. Check the health endpoints for configuration status
2. Review browser console and server logs
3. Verify all environment variables are set correctly
4. Test with a fresh browser session (clear cache/localStorage)

The app is designed to work seamlessly in both development and production environments with automatic URL detection and comprehensive error handling. 
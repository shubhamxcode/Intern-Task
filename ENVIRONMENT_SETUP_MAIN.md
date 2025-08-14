# 🚀 Test Case Generator - Complete Environment Setup

This guide provides a comprehensive overview of setting up the Test Case Generator application for both localhost development and production deployment.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │     GitHub     │
│   (Vercel)      │◄──►│    (Render)     │◄──►│     OAuth      │
│                 │    │                 │    │                 │
│ https://intern- │    │ https://intern- │    │ https://github │
│ task-nu7c.verce│    │ task-65q2.onren │    │ .com/login/    │
│ l.app           │    │ der.com         │    │ oauth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌐 URL Configuration

| Component | Localhost | Production |
|-----------|-----------|------------|
| **Frontend** | `http://localhost:3000` | `https://intern-task-nu7c.vercel.app` |
| **Backend API** | `http://localhost:5000/api` | `https://intern-task-65q2.onrender.com/api` |
| **OAuth Callback** | `http://localhost:3000/auth/github/callback` | `https://intern-task-nu7c.vercel.app/auth/github/callback` |

## 🚀 Quick Start

### 1. Backend Setup (Render)

1. **Environment Variables in Render Dashboard:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://intern-task-nu7c.vercel.app
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Build Command:** `npm install`
3. **Start Command:** `npm start`

### 2. Frontend Setup (Vercel)

1. **Environment Variables in Vercel Dashboard:**
   ```env
   VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
   VITE_APP_NAME=Test Case Generator
   VITE_GITHUB_OAUTH_CALLBACK_URL=https://intern-task-nu7c.vercel.app/auth/github/callback
   ```

2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`

### 3. GitHub OAuth App Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create/Update OAuth App with:
   - **Homepage URL**: `https://intern-task-nu7c.vercel.app`
   - **Authorization callback URL**: `https://intern-task-nu7c.vercel.app/auth/github/callback`

## 🏠 Localhost Development

### Backend (Port 5000)

1. **Copy environment template:**
   ```bash
   cd Backend
   cp env.example .env
   ```

2. **Fill in `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000,https://intern-task-nu7c.vercel.app
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Frontend (Port 3000)

1. **Copy environment template:**
   ```bash
   cd Frontend
   cp env.example .env
   ```

2. **Fill in `.env` file:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=Test Case Generator
   VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔧 Key Features

### ✅ Proxy Support
- Backend automatically handles proxy configurations for Render/Heroku
- CORS configured for multiple frontend URLs
- Rate limiting works behind proxy servers

### ✅ Environment Detection
- Automatic detection of development vs production
- Dynamic API URL configuration
- OAuth redirect validation

### ✅ Multi-Environment Support
- Single codebase works for localhost and production
- Environment-specific configurations
- Easy switching between environments

## 🚨 Troubleshooting

### Common Issues

1. **Render Deployment Fails**
   - Check environment variables are set correctly
   - Ensure `NODE_ENV=production`
   - Verify all required variables are present

2. **Vercel Build Fails**
   - Check environment variables in Vercel dashboard
   - Ensure `VITE_API_BASE_URL` points to correct backend
   - Verify build command is `npm run build`

3. **OAuth Errors**
   - Check GitHub OAuth App callback URLs
   - Ensure frontend URL is included in backend CORS
   - Verify environment variables match between services

4. **CORS Errors**
   - Check `FRONTEND_URL` in backend environment
   - Ensure frontend URL is included in CORS origins
   - Verify both localhost and production URLs are configured

### Debug Commands

```bash
# Backend health check
curl http://localhost:5000/health

# Check environment variables
echo $FRONTEND_URL
echo $VITE_API_BASE_URL

# Kill port conflicts
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

## 📚 Detailed Guides

- **[Backend Setup](./Backend/ENVIRONMENT_SETUP.md)** - Complete backend configuration
- **[Frontend Setup](./Frontend/ENVIRONMENT_SETUP.md)** - Complete frontend configuration
- **[Backend Code](./Backend/src/)** - Backend source code and configuration
- **[Frontend Code](./Frontend/src/)** - Frontend source code and configuration

## 🔄 Environment Switching

### Quick Switch to Production Backend

To test production backend with localhost frontend:

```bash
# In Frontend/.env
VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
```

### Quick Switch to Localhost Backend

```bash
# In Frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🎯 Production Checklist

- [ ] Backend deployed to Render with correct environment variables
- [ ] Frontend deployed to Vercel with correct environment variables
- [ ] GitHub OAuth App configured with production URLs
- [ ] CORS configured for production frontend URL
- [ ] All API keys and secrets configured
- [ ] Health endpoints responding correctly
- [ ] OAuth flow working in production

## 📞 Support

If you encounter issues:

1. Check the detailed setup guides in each directory
2. Verify all environment variables are set correctly
3. Check the troubleshooting section above
4. Ensure both services are running and accessible
5. Verify GitHub OAuth App configuration

## 🚀 Deployment Status

- **Backend**: ✅ Deployed to Render at `https://intern-task-65q2.onrender.com`
- **Frontend**: ✅ Deployed to Vercel at `https://intern-task-nu7c.vercel.app`
- **OAuth**: ⚠️ Requires GitHub OAuth App configuration
- **Environment**: ⚠️ Requires environment variable setup in both platforms 
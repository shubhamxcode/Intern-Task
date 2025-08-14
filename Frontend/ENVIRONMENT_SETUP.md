# Frontend Environment Setup Guide

This guide explains how to configure the Test Case Generator Frontend for both localhost development and production deployment.

## 🏠 Localhost Development

### 1. Create `.env` file
Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

### 2. Required Environment Variables

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Frontend Configuration
VITE_APP_NAME=Test Case Generator
VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Production URLs (for reference)
VITE_PRODUCTION_BACKEND_URL=https://intern-task-65q2.onrender.com
VITE_PRODUCTION_FRONTEND_URL=https://intern-task-nu7c.vercel.app
```

### 3. Run the Frontend

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Production Deployment (Vercel)

### 1. Environment Variables in Vercel

Set these environment variables in your Vercel dashboard:

```env
VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
VITE_APP_NAME=Test Case Generator
VITE_GITHUB_OAUTH_CALLBACK_URL=https://intern-task-nu7c.vercel.app/auth/github/callback
```

### 2. Build Configuration

Vercel will automatically:
- Install dependencies with `npm install`
- Build the project with `npm run build`
- Serve the built files from the `dist` directory

### 3. Domain Configuration

Your app will be available at:
- **Primary URL**: `https://intern-task-nu7c.vercel.app`
- **Backend API**: `https://intern-task-65q2.onrender.com`

## 🔧 Configuration Details

### API Service Configuration

The frontend automatically detects the environment and configures:

- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses `https://intern-task-65q2.onrender.com/api`

### GitHub OAuth Flow

1. **Authorization Request**: Frontend requests OAuth URL from backend
2. **User Redirect**: User is redirected to GitHub for authorization
3. **Callback Handling**: GitHub redirects back to the configured callback URL
4. **Token Exchange**: Backend exchanges code for access token

### Environment Detection

The application automatically detects:
- Development vs Production environment
- API base URL configuration
- OAuth callback URLs

## 🌐 URL Configuration Matrix

| Environment | Frontend URL | Backend API | OAuth Callback |
|-------------|--------------|-------------|----------------|
| **Localhost** | `http://localhost:3000` | `http://localhost:5000/api` | `http://localhost:3000/auth/github/callback` |
| **Production** | `https://intern-task-nu7c.vercel.app` | `https://intern-task-65q2.onrender.com/api` | `https://intern-task-nu7c.vercel.app/auth/github/callback` |

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS configuration includes your frontend URL
2. **OAuth Redirect Errors**: Check that your GitHub OAuth App has the correct callback URLs
3. **API Connection Errors**: Verify the `VITE_API_BASE_URL` is correct for your environment

### Debug Mode

Enable debug logging by checking the browser console in development mode. The app logs:
- API configuration details
- Environment detection
- OAuth flow status

### Testing OAuth Flow

1. **Localhost**: Use `http://localhost:3000` for development
2. **Production**: Use `https://intern-task-nu7c.vercel.app` for production
3. **Mixed Testing**: You can test production backend with localhost frontend by setting `VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api`

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [React OAuth Best Practices](https://react.dev/learn/authentication)

## 🔄 Environment Switching

### Quick Environment Switch

To switch between environments quickly, update your `.env` file:

```bash
# For localhost development
VITE_API_BASE_URL=http://localhost:5000/api

# For production testing
VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
```

### Multiple Environment Files

You can create multiple environment files:

```bash
# .env.local (localhost)
VITE_API_BASE_URL=http://localhost:5000/api

# .env.production (production)
VITE_API_BASE_URL=https://intern-task-65q2.onrender.com/api
```

Then use:
```bash
# Development
npm run dev

# Production build
npm run build
``` 
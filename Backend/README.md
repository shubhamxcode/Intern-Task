# Test Case Generator - Backend

A Node.js/Express backend API for the Test Case Generator application that integrates with GitHub OAuth and AI APIs to generate automated test cases.

## 🚀 Features

- **GitHub OAuth Integration**: Secure authentication with GitHub
- **Repository Management**: Browse and select repositories and files
- **AI-Powered Test Generation**: Generate test case summaries and code using OpenAI or Gemini
- **Pull Request Creation**: Automatically create PRs with generated test files
- **Multiple Framework Support**: Jest, Pytest, JUnit, and more
- **Rate Limiting & Security**: Built-in security measures and API rate limiting

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/        # API logic controllers
│   │   ├── authController.js
│   │   ├── githubController.js
│   │   └── testCaseController.js
│   ├── routes/            # Express route definitions
│   │   ├── auth.js
│   │   ├── github.js
│   │   └── testCases.js
│   ├── services/          # External API integrations
│   │   ├── githubService.js
│   │   └── aiService.js
│   ├── middlewares/       # Express middlewares
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── config/           # Application configuration
│   │   └── app.js
│   ├── utils/            # Helper utilities
│   │   └── helpers.js
│   └── app.js            # Main application file
├── env.example           # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **GitHub OAuth App** (see setup instructions below)
- **AI API Key** (OpenAI or Google Gemini)

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Configuration

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# GitHub OAuth Configuration
# 🔥 REQUIRED: Create a GitHub OAuth App at: https://github.com/settings/applications/new
# Set Authorization callback URL to: http://localhost:3000/auth/github/callback
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# AI API Configuration (Choose one or both)
# 🔥 REQUIRED: At least one AI API key is required
# Option 1: OpenAI (Recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Option 2: Google Gemini (Alternative)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# 🔥 REQUIRED: JWT Secret for authentication (minimum 32 characters)
JWT_SECRET=your_super_secure_jwt_secret_with_at_least_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GITHUB_API_URL=https://api.github.com
```

### 3. GitHub OAuth App Setup

1. Go to [GitHub OAuth Apps](https://github.com/settings/applications/new)
2. Fill in the application details:
   - **Application name**: Test Case Generator
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Copy the **Client ID** and **Client Secret** to your `.env` file

### 4. AI API Setup

#### Option A: OpenAI (Recommended)
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

#### Option B: Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GOOGLE_GEMINI_API_KEY`

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📋 API Documentation

### Authentication Endpoints

#### Get GitHub OAuth URL
```http
GET /api/auth/github-url
```

#### Handle OAuth Callback
```http
POST /api/auth/github/callback
Content-Type: application/json

{
  "code": "github_oauth_code",
  "state": "csrf_state"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

### GitHub Integration Endpoints

#### Get Repositories
```http
POST /api/github/repositories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token"
}
```

#### Get Repository Contents
```http
POST /api/github/:owner/:repo/contents?path=src
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token"
}
```

#### Get Multiple Files
```http
POST /api/github/:owner/:repo/files
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token",
  "filePaths": ["src/App.js", "src/utils/helpers.js"]
}
```

### Test Case Generation Endpoints

#### Generate Test Summaries
```http
POST /api/test-cases/generate-summaries
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token",
  "files": [
    {"path": "src/App.js"},
    {"path": "src/utils/helpers.js"}
  ],
  "owner": "username",
  "repo": "repository"
}
```

#### Generate Test Code
```http
POST /api/test-cases/generate-code
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token",
  "testSummary": {
    "id": "test-1",
    "title": "Should validate user input",
    "description": "Test description",
    "type": "unit",
    "file": "src/utils/validation.js"
  },
  "owner": "username",
  "repo": "repository",
  "framework": "jest"
}
```

#### Create Pull Request with Tests
```http
POST /api/test-cases/create-pull-request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accessToken": "github_access_token",
  "testFiles": [
    {
      "fileName": "App.test.js",
      "content": "// test code here"
    }
  ],
  "owner": "username",
  "repo": "repository",
  "title": "Add AI-generated test cases",
  "description": "Auto-generated tests for improved code coverage"
}
```

## 🔧 Available Scripts

```bash
# Start server in development mode with hot reload
npm run dev

# Start server in production mode
npm start

# Run tests (when implemented)
npm test
```

## 🌐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App Client ID | `abc123def456` |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App Client Secret | `secret123` |
| `OPENAI_API_KEY` | ⚠️* | OpenAI API Key | `sk-proj-...` |
| `GOOGLE_GEMINI_API_KEY` | ⚠️* | Google Gemini API Key | `AIza...` |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) | `your-super-secret-jwt-key-here` |
| `PORT` | ❌ | Server port | `5000` |
| `NODE_ENV` | ❌ | Environment mode | `development` |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS | `http://localhost:3000` |

*At least one AI API key is required

## 🚨 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure all required environment variables are set in `.env`
   - Check that your `.env` file is in the `Backend` directory

2. **"GitHub OAuth error"**
   - Verify your GitHub OAuth app settings
   - Check that the callback URL matches exactly
   - Ensure your Client ID and Secret are correct

3. **"Invalid GitHub access token"**
   - The GitHub access token expires - re-authenticate
   - Check token permissions (should include `repo` and `user:email`)

4. **"AI API request failed"**
   - Verify your API key is correct and active
   - Check your API quota/billing status
   - Ensure you have the correct API endpoint

5. **"CORS error"**
   - Check that `FRONTEND_URL` matches your frontend URL exactly
   - Ensure the frontend is running on the specified port

### Debug Mode

Set `NODE_ENV=development` in your `.env` to enable:
- Detailed error messages
- Request logging
- Stack traces in API responses

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses without sensitive data leaks

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your environment configuration
3. Check the console logs for detailed error messages
4. Create an issue with detailed error information 
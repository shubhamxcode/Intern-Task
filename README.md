# 🧪 Test Case Generator

A full-stack application that uses AI to automatically generate comprehensive test cases for your GitHub repositories. Built with React, Node.js, and integrated with GitHub OAuth and AI APIs.

## 🌟 Overview

The Test Case Generator streamlines the testing process by:

1. **🔐 GitHub Integration**: Authenticate with GitHub and browse your repositories
2. **📁 File Selection**: Choose specific code files you want to test
3. **🤖 AI Analysis**: AI analyzes your code and suggests test case summaries
4. **⚡ Test Generation**: Generate actual, runnable test code in your preferred framework
5. **🚀 Auto Pull Requests**: Automatically create pull requests with your generated tests

## 🎯 Features

### Core Functionality
- **GitHub OAuth Authentication**: Secure integration with your GitHub account
- **Repository Browser**: Intuitive interface to explore your repositories
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, and more
- **Framework Flexibility**: Jest, Pytest, JUnit, and other popular testing frameworks
- **AI-Powered Generation**: Uses OpenAI or Google Gemini for intelligent test case creation
- **Pull Request Automation**: Creates PRs with generated test files automatically

### Technical Features
- **Modern Architecture**: Clean separation between frontend and backend
- **Type Safety**: Full TypeScript support for better development experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: JWT authentication, CORS protection, and secure API calls

## 🏗️ Architecture

```
Test Case Generator/
├── Backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # API endpoint logic
│   │   ├── routes/         # Express routes
│   │   ├── services/       # GitHub & AI integrations
│   │   ├── middlewares/    # Auth & error handling
│   │   ├── config/         # App configuration
│   │   └── utils/          # Helper functions
│   ├── env.example         # Environment template
│   └── README.md           # Backend documentation
│
├── Frontend/               # React + TypeScript SPA
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # State management
│   │   └── services/       # API client
│   ├── env.example         # Environment template
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** or **yarn**
- **GitHub OAuth App** (instructions below)
- **AI API Key** (OpenAI or Google Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/test-case-generator.git
cd test-case-generator
```

### 2. Setup GitHub OAuth App

1. Go to [GitHub OAuth Apps](https://github.com/settings/applications/new)
2. Create a new OAuth app with these settings:
   - **Application name**: Test Case Generator
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Save the **Client ID** and **Client Secret**

### 3. Get AI API Key

**Option A: OpenAI (Recommended)**
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key

**Option B: Google Gemini**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key

### 4. Setup Backend

```bash
cd Backend
npm install
cp env.example .env
```

Edit `Backend/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### 5. Setup Frontend

```bash
cd Frontend
npm install
cp env.example .env
```

Edit `Frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

Start the frontend:
```bash
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## 📖 Usage Guide

### Step 1: Authentication
1. Click "Sign in with GitHub" on the landing page
2. Authorize the application to access your repositories
3. You'll be redirected to the dashboard

### Step 2: Select Repository
1. Browse your GitHub repositories
2. Click on a repository to select it
3. The application will load the repository structure

### Step 3: Choose Files
1. Navigate through folders and files
2. Select code files you want to generate tests for
3. You can select up to 5 files at once

### Step 4: Review Test Summaries
1. AI analyzes your code and generates test case summaries
2. Review the suggested test cases
3. Select which summaries you want to generate full tests for

### Step 5: Generate Test Code
1. Click on any summary to generate the actual test code
2. Review and customize the generated tests
3. Choose your preferred testing framework

### Step 6: Create Pull Request
1. Review all generated test files
2. Customize the pull request title and description
3. Click "Create Pull Request" to automatically submit to GitHub

## 🛠️ Development

### Backend Development
See [Backend README](Backend/README.md) for detailed backend setup and API documentation.

### Frontend Development
See [Frontend README](Frontend/README.md) for detailed frontend setup and component documentation.

### Project Structure
- **Backend**: RESTful API with Express.js, JWT authentication, GitHub & AI integrations
- **Frontend**: React SPA with TypeScript, TailwindCSS, and Zustand for state management

## 📚 API Documentation

### Authentication Endpoints
- `GET /api/auth/github-url` - Get GitHub OAuth URL
- `POST /api/auth/github/callback` - Handle OAuth callback
- `GET /api/auth/verify` - Verify JWT token

### GitHub Integration
- `POST /api/github/repositories` - Get user repositories
- `POST /api/github/:owner/:repo/contents` - Get repository contents
- `POST /api/github/:owner/:repo/files` - Get multiple file contents

### Test Generation
- `POST /api/test-cases/generate-summaries` - Generate test summaries
- `POST /api/test-cases/generate-code` - Generate test code
- `POST /api/test-cases/create-pull-request` - Create PR with tests

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
GITHUB_CLIENT_ID=required
GITHUB_CLIENT_SECRET=required
OPENAI_API_KEY=required (or GOOGLE_GEMINI_API_KEY)
JWT_SECRET=required
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication fails**
   - Verify GitHub OAuth app settings match your URLs
   - Check that Client ID and Secret are correct
   - Ensure callback URL is exactly: `http://localhost:3000/auth/github/callback`

2. **AI generation fails**
   - Verify your API key is correct and active
   - Check your API quota/billing status
   - Ensure you have at least one AI API key configured

3. **Cannot connect to backend**
   - Verify backend is running on port 5000
   - Check CORS settings in backend
   - Confirm `VITE_API_BASE_URL` in frontend matches backend URL

4. **Pull request creation fails**
   - Ensure you have write access to the repository
   - Check that the GitHub token has sufficient permissions
   - Verify the repository exists and is accessible

### Debug Mode
Set `NODE_ENV=development` in both environments for detailed logging.

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🆘 Support

- 📖 Check the [Backend README](Backend/README.md) for backend-specific issues
- 🎨 Check the [Frontend README](Frontend/README.md) for frontend-specific issues
- 🐛 [Create an issue](https://github.com/your-username/test-case-generator/issues) for bugs
- 💡 [Start a discussion](https://github.com/your-username/test-case-generator/discussions) for questions

## 🗺️ Roadmap

- [ ] Support for more programming languages
- [ ] Additional testing frameworks
- [ ] Code coverage analysis
- [ ] Test execution and reporting
- [ ] Integration with CI/CD pipelines
- [ ] Collaborative test review features
- [ ] Performance test generation
- [ ] Visual test report generation

---

**Built with ❤️ for developers who want to focus on building features, not writing tests.** 
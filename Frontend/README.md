# Test Case Generator - Frontend

A modern React frontend for the Test Case Generator application that provides an intuitive interface for generating AI-powered test cases from GitHub repositories.

## 🚀 Features

- **Modern React with TypeScript**: Type-safe development with excellent developer experience
- **Responsive Design**: Beautiful, mobile-first UI built with TailwindCSS
- **GitHub OAuth Integration**: Secure authentication with GitHub
- **Repository Browser**: Intuitive interface to browse and select repository files
- **Step-by-Step Workflow**: Guided process for generating test cases
- **Real-time Feedback**: Instant feedback with toast notifications
- **State Management**: Efficient state management with Zustand
- **Code Syntax Highlighting**: Syntax-highlighted code display

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── RepositorySelector.tsx
│   │   ├── FileSelector.tsx
│   │   ├── TestSummariesView.tsx
│   │   ├── TestCodeView.tsx
│   │   └── ReviewAndSubmit.tsx
│   ├── pages/            # Main application pages
│   │   ├── LandingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── GitHubCallbackPage.tsx
│   ├── context/          # Global state management
│   │   ├── useAuthStore.ts
│   │   └── useAppStore.ts
│   ├── services/         # API communication layer
│   │   └── api.ts
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── env.example           # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # TailwindCSS configuration
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

## 🛠️ Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:5000` (see Backend README)

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Frontend Configuration
VITE_APP_NAME=Test Case Generator
VITE_GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🚨 Troubleshooting

### Common Issues

1. **"Network Error" on login**
   - Check that the backend is running on port 5000
   - Verify `VITE_API_BASE_URL` in your `.env` file

2. **GitHub OAuth not working**
   - Verify callback URL matches GitHub OAuth app settings
   - Check backend GitHub OAuth configuration

3. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

## 📄 License

MIT License - see LICENSE file for details

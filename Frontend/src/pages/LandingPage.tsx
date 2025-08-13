import React from 'react';
import { Github, TestTube, FileText, GitPullRequest, Zap, Shield, Code } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage: React.FC = () => {
  const { loginWithGitHub, isLoading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const features = [
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub Integration",
      description: "Seamlessly connect with your GitHub repositories and browse your code files."
    },
    {
      icon: <TestTube className="w-6 h-6" />,
      title: "AI-Powered Test Generation",
      description: "Generate comprehensive test cases using advanced AI technology."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multiple Frameworks",
      description: "Support for Jest, Pytest, JUnit, and many other testing frameworks."
    },
    {
      icon: <GitPullRequest className="w-6 h-6" />,
      title: "Auto Pull Requests",
      description: "Automatically create pull requests with your generated test files."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast & Efficient",
      description: "Generate high-quality test cases in seconds, not hours."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your code never leaves your control. We only analyze what you share."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Code className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Test Case Generator</h1>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
              ) : (
                <Github className="w-4 h-4 mr-2" />
              )}
              Sign in with GitHub
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Generate Test Cases with
            <span className="text-blue-600 block">AI Precision</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automatically generate comprehensive test cases for your GitHub repositories using 
            advanced AI. Support for multiple programming languages and testing frameworks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              Get Started with GitHub
            </button>
            <a
              href="#features"
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Learn More
            </a>
          </div>

          {/* Demo Screenshot/Video Placeholder */}
          <div className="bg-white rounded-lg shadow-xl p-4 mb-16">
            <div className="bg-gray-100 rounded-lg h-64 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Demo Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate your testing workflow and improve code quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-white rounded-2xl shadow-lg mt-16">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Get started in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Connect GitHub",
                  description: "Authenticate with your GitHub account to access your repositories."
                },
                {
                  step: 2,
                  title: "Select Files",
                  description: "Choose the code files you want to generate test cases for."
                },
                {
                  step: 3,
                  title: "Generate Tests",
                  description: "Our AI analyzes your code and generates comprehensive test summaries."
                },
                {
                  step: 4,
                  title: "Review & Deploy",
                  description: "Review the generated tests and create a pull request automatically."
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Automate Your Testing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join developers who are already saving hours with AI-generated test cases.
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" className="mr-2" />
            ) : (
              <Github className="w-5 h-5 mr-2" />
            )}
            Start Generating Tests
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 Test Case Generator. Built with ❤️ for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
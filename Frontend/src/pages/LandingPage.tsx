import { useState, useEffect } from 'react';
import { Github, Zap, Code, GitPullRequest, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { RetroGrid } from '../components/magicui/retro-grid';

const LandingPage = () => {
  const { loginWithGitHub, isLoading: authLoading } = useAuthStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error('Login failed:', error);
      // Test backend connectivity
      try {
        const response = await fetch('http://localhost:5000/api/auth/github-url');
        console.log('Backend connection test:', response.status);
        if (!response.ok) {
          alert(`Backend error: ${response.status}. Please check if the backend server is running.`);
        }
      } catch (fetchError) {
        console.error('Backend connection failed:', fetchError);
        alert('Cannot connect to backend server. Please ensure the backend is running on localhost:5000');
      }
    }
  };

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Smart File Selection",
      description: "AI-powered suggestions for which files need testing most",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Generation",
      description: "Generate comprehensive test suites in seconds, not hours",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <GitPullRequest className="w-6 h-6" />,
      title: "Seamless Integration",
      description: "Direct PR creation with detailed test coverage reports",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900 relative overflow-x-hidden">
      {/* Header */}
      <header className="z-50 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 backdrop-blur-md bg-white/70 border-b border-blue-100/50 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              TestCraft
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="group relative px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100 hover:from-blue-500 hover:to-indigo-500"
            >
              {authLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <span className="hidden sm:inline">Connecting...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sign In with GitHub</span>
                  <span className="sm:hidden">Sign In</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with RetroGrid */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* RetroGrid Background */}
        <RetroGrid 
          className="z-0"
          angle={65}
          cellSize={60}
          opacity={0.3}
          lightLineColor="rgb(59 130 246 / 0.5)"
          darkLineColor="rgb(99 102 241 / 0.5)"
        />
        
        {/* Enhanced Interactive Elements */}
        <div className="absolute inset-0 z-10 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.4) 0%, transparent 40%)`
          }} />
        </div>

        {/* Enhanced Floating particles */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Enhanced Hero Content */}
        <div className="relative z-20 text-center max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-12">
            {/* Enhanced Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-4 sm:mb-6 tracking-tight">
              TestCraft
              <span className="block text-3xl sm:text-5xl lg:text-6xl xl:text-7xl mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            
            {/* Enhanced Subtitle */}
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed px-4">
              <span className="font-light">Transform your development workflow with</span>
              <span className="font-bold text-blue-700 mx-2">intelligent test generation.</span>
              <br className="hidden sm:block" />
              <span className="text-indigo-600 font-semibold block sm:inline mt-2 sm:mt-0">
                Connect, analyze, and ship with confidence.
              </span>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16 px-4">
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="group relative w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-base sm:text-lg lg:text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100 hover:from-blue-500 hover:to-indigo-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              
              {authLoading ? (
                <div className="flex items-center justify-center relative z-10">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  <span className="hidden sm:inline">Connecting to GitHub...</span>
                  <span className="sm:hidden">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center relative z-10">
                  <Github className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  <span className="hidden sm:inline">Start Building Tests Now</span>
                  <span className="sm:hidden">Get Started</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>

          </div>

          {/* Enhanced Scroll indicator */}
          <button 
            onClick={scrollToFeatures}
            className="group flex flex-col items-center text-gray-500 hover:text-blue-600 transition-all duration-300 mt-8 sm:mt-12 lg:mt-20"
          >
            
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-30 py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TestCraft?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of automated testing with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100/60 hover:border-blue-200 transition-all duration-500 hover:scale-105 hover:bg-white/90 shadow-lg hover:shadow-xl"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-30 border-t border-blue-100/60 py-12 sm:py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">TestCraft</span>
          </div>
          <p className="text-gray-600">&copy; 2024 TestCraft. Crafted for developers who ship fast.</p>
          <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import { useState, useEffect } from 'react';
import { Github, Zap, Code, GitPullRequest, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { MorphingText } from '../components/magicui/morphing-text';
import { TextReveal } from '../components/magicui/text-reveal';

const LandingPage = () => {
  const { loginWithGitHub, isLoading: authLoading } = useAuthStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const morphingTexts = [
    "Generate test cases with AI",
    "Ship with confidence",
    "Test smarter, not harder",
    "AI-powered testing",
    "Automate your testing"
  ];

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e:any) => {
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
      gradient: "from-slate-600 to-slate-700"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Generation",
      description: "Generate comprehensive test suites in seconds, not hours",
      gradient: "from-slate-700 to-slate-800"
    },
    {
      icon: <GitPullRequest className="w-6 h-6" />,
      title: "Seamless Integration",
      description: "Direct PR creation with detailed test coverage reports",
      gradient: "from-slate-600 to-slate-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative scroll-smooth">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(71, 85, 105, 0.4) 0%, transparent 40%)`
        }} />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 backdrop-blur-sm bg-white/5 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              TestCraft
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Trusted by 10k+ developers</span>
            </div>
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="group relative px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-800/50 disabled:opacity-50 disabled:hover:scale-100 hover:from-slate-600 hover:to-slate-500"
            >
              {authLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-slate-800/60 rounded-full border border-slate-600/40 mb-6">
            <span className="text-slate-300 text-sm font-medium">✨ Powered by Advanced AI</span>
          </div>
          
          <div className="mb-8">
            <MorphingText 
              texts={morphingTexts}
              className="text-6xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent"
            />
          </div>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your development workflow with intelligent test generation. 
            <span className="text-slate-100 font-semibold"> Connect, analyze, and ship </span>
            with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="group relative px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-800/50 disabled:opacity-50 disabled:hover:scale-100 hover:from-slate-600 hover:to-slate-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity" />
              
              {authLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Github className="w-5 h-5 mr-3" />
                  Continue with GitHub
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
            
            <div className="flex items-center text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
              <span>Free forever • No credit card</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-16 text-center">
            {[
              { number: "50k+", label: "Tests Generated" },
              { number: "99%", label: "Code Coverage" },
              { number: "10x", label: "Faster Testing" }
            ].map((stat, i) => (
              <div key={i} className="px-6 py-4 bg-slate-900/60 rounded-xl backdrop-blur-sm border border-slate-700/40">
                <div className="text-2xl font-bold text-slate-200">{stat.number}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 hover:border-slate-600/60 transition-all duration-500 hover:scale-105 hover:bg-slate-900/60"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-slate-200 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Code Preview */}
        <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/40 p-8 mb-16">
          <div className="flex items-center mb-6">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-slate-400 text-sm">Generated Test Suite</span>
          </div>
          <pre className="text-emerald-400 text-sm overflow-x-auto">
{`describe('UserService', () => {
  test('should create user with valid data', async () => {
    const userData = { name: 'John', email: 'john@test.com' };
    const result = await userService.create(userData);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('John');
  });
  
  test('should handle validation errors', async () => {
    const invalidData = { name: '', email: 'invalid' };
    await expect(userService.create(invalidData))
      .rejects.toThrow('Validation failed');
  });
});`}
          </pre>
        </div>
      </main>

      {/* Text Reveal Section */}
      <section className="relative">
        <div className="h-16 bg-gradient-to-b from-slate-950 to-slate-950/90"></div>
        <TextReveal className="bg-gradient-to-br from-slate-950/90 to-slate-900/90">
          Experience the future of testing. Our AI understands your code patterns, anticipates edge cases, and generates comprehensive test suites that catch bugs before they reach production. Join thousands of developers who trust TestCraft to deliver bulletproof applications with confidence.
        </TextReveal>
        <div className="h-16 bg-gradient-to-b from-slate-900/90 to-slate-950"></div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/40 py-16 bg-slate-900/40 backdrop-blur-sm mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-semibold text-slate-300">TestCraft</span>
          </div>
          <p className="text-slate-400">&copy; 2024 TestCraft. Crafted for developers who ship fast.</p>
        </div>
      </footer>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
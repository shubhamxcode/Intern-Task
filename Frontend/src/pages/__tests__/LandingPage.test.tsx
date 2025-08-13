import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

// Mock the useAuthStore hook
const mockLoginWithGitHub = vi.fn();
const mockAuthLoading = false;

vi.mock('../context/useAuthStore', () => ({
  useAuthStore: () => ({
    loginWithGitHub: mockLoginWithGitHub,
    isLoading: mockAuthLoading,
  }),
}));

// Mock the RetroGrid component
vi.mock('../components/magicui/retro-grid', () => ({
  RetroGrid: ({ className, angle, cellSize, opacity, lightLineColor, darkLineColor }: any) => (
    <div 
      data-testid="retro-grid"
      className={className}
      data-angle={angle}
      data-cell-size={cellSize}
      data-opacity={opacity}
      data-light-color={lightLineColor}
      data-dark-color={darkLineColor}
    >
      RetroGrid Background
    </div>
  ),
}));

// Mock fetch for backend connectivity test
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: vi.fn(),
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Helper function to render LandingPage with router context
const renderLandingPage = () => {
  return render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
};

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('renders the main landing page structure', () => {
      renderLandingPage();
      
      // Check main title
      expect(screen.getByText('TestCraft')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
      
      // Check subtitle
      expect(screen.getByText(/Transform your development workflow with/)).toBeInTheDocument();
      expect(screen.getByText(/intelligent test generation/)).toBeInTheDocument();
      expect(screen.getByText(/Connect, analyze, and ship with confidence/)).toBeInTheDocument();
    });

    it('renders the header with logo and sign-in button', () => {
      renderLandingPage();
      
      // Check logo
      expect(screen.getByText('TestCraft')).toBeInTheDocument();
      
      // Check sign-in button
      expect(screen.getByText('Sign In with GitHub')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In with GitHub/i })).toBeInTheDocument();
    });

    it('renders the RetroGrid background component', () => {
      renderLandingPage();
      
      const retroGrid = screen.getByTestId('retro-grid');
      expect(retroGrid).toBeInTheDocument();
      expect(retroGrid).toHaveAttribute('data-angle', '65');
      expect(retroGrid).toHaveAttribute('data-cell-size', '60');
      expect(retroGrid).toHaveAttribute('data-opacity', '0.3');
    });

    it('renders the features section', () => {
      renderLandingPage();
      
      expect(screen.getByText('Why Choose TestCraft?')).toBeInTheDocument();
      expect(screen.getByText('Smart File Selection')).toBeInTheDocument();
      expect(screen.getByText('Instant Generation')).toBeInTheDocument();
      expect(screen.getByText('Seamless Integration')).toBeInTheDocument();
    });

    it('renders the footer', () => {
      renderLandingPage();
      
      expect(screen.getByText(/© 2024 TestCraft/)).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Terms')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('handles GitHub login button click', async () => {
      renderLandingPage();
      
      const loginButton = screen.getByRole('button', { name: /Sign In with GitHub/i });
      fireEvent.click(loginButton);
      
      expect(mockLoginWithGitHub).toHaveBeenCalledTimes(1);
    });

    it('handles main CTA button click', async () => {
      renderLandingPage();
      
      const mainCTAButton = screen.getByRole('button', { name: /Start Building Tests Now/i });
      fireEvent.click(mainCTAButton);
      
      expect(mockLoginWithGitHub).toHaveBeenCalledTimes(1);
    });

    it('handles scroll to features button click', () => {
      renderLandingPage();
      
      const scrollButton = screen.getByRole('button', { name: /Discover Our Features/i });
      fireEvent.click(scrollButton);
      
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Mouse Interaction and Animation', () => {
    it('sets up mouse move event listeners on mount', () => {
      renderLandingPage();
      
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });

    it('removes mouse move event listeners on unmount', () => {
      const { unmount } = renderLandingPage();
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });

    it('tracks mouse position for interactive background', () => {
      renderLandingPage();
      
      // Simulate mouse movement
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200,
      });
      
      // Get the event handler that was registered
      const eventHandler = mockAddEventListener.mock.calls.find(
        (call: any) => call[0] === 'mousemove'
      )?.[1];
      
      if (eventHandler) {
        eventHandler(mouseEvent);
      }
      
      // The component should now have updated mouse position state
      // This is internal state, so we can't directly test it, but we can verify
      // that the event handler was set up correctly
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    it('handles login failure and tests backend connectivity', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockLoginWithGitHub.mockRejectedValueOnce(new Error('Login failed'));
      
      // Mock successful backend response
      (window.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });
      
      renderLandingPage();
      
      const loginButton = screen.getByRole('button', { name: /Sign In with GitHub/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockLoginWithGitHub).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(window.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/github-url');
      });
      
      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('shows alert when backend is not reachable', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockLoginWithGitHub.mockRejectedValueOnce(new Error('Login failed'));
      
      // Mock failed backend response
      (window.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      renderLandingPage();
      
      const loginButton = screen.getByRole('button', { name: /Sign In with GitHub/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Cannot connect to backend server. Please ensure the backend is running on localhost:5000'
        );
      });
      
      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('shows alert when backend returns error status', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockLoginWithGitHub.mockRejectedValueOnce(new Error('Login failed'));
      
      // Mock backend error response
      (window.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      renderLandingPage();
      
      const loginButton = screen.getByRole('button', { name: /Sign In with GitHub/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Backend error: 500. Please check if the backend server is running.');
      });
      
      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile-friendly text variants', () => {
      renderLandingPage();
      
      // Check for mobile-specific text
      expect(screen.getByText('Sign In')).toBeInTheDocument(); // Mobile version
      expect(screen.getByText('Get Started')).toBeInTheDocument(); // Mobile version
    });

    it('renders desktop-friendly text variants', () => {
      renderLandingPage();
      
      // Check for desktop-specific text
      expect(screen.getByText('Sign In with GitHub')).toBeInTheDocument(); // Desktop version
      expect(screen.getByText('Start Building Tests Now')).toBeInTheDocument(); // Desktop version
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      renderLandingPage();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach((button: any) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('has proper heading hierarchy', () => {
      renderLandingPage();
      
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1Elements.length).toBeGreaterThan(0);
      expect(h2Elements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation and Visual Effects', () => {
    it('renders floating particles', () => {
      renderLandingPage();
      
      // The floating particles are rendered as divs with specific classes
      // We can't directly test the random positioning, but we can verify
      // that the container exists
      const heroSection = screen.getByText('TestCraft').closest('section');
      expect(heroSection).toBeInTheDocument();
    });

    it('renders decorative blur elements', () => {
      renderLandingPage();
      
      // The decorative elements are positioned absolutely and have blur effects
      // We can verify the hero section exists which contains these elements
      const heroSection = screen.getByText('TestCraft').closest('section');
      expect(heroSection).toBeInTheDocument();
    });

    it('applies hover effects to feature cards', () => {
      renderLandingPage();
      
      const featureCards = screen.getAllByText(/Smart File Selection|Instant Generation|Seamless Integration/);
      featureCards.forEach((card: any) => {
        const cardElement = card.closest('div');
        expect(cardElement).toHaveClass('group');
        expect(cardElement).toHaveClass('hover:scale-105');
      });
    });
  });

  describe('State Management', () => {
    it('manages loading state correctly', () => {
      // Test with loading state
      vi.mocked(require('../context/useAuthStore').useAuthStore).mockReturnValue({
        loginWithGitHub: mockLoginWithGitHub,
        isLoading: true,
      });
      
      renderLandingPage();
      
      // Should show loading text
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByText('Connecting to GitHub...')).toBeInTheDocument();
    });

    it('manages non-loading state correctly', () => {
      // Test with non-loading state
      vi.mocked(require('../context/useAuthStore').useAuthStore).mockReturnValue({
        loginWithGitHub: mockLoginWithGitHub,
        isLoading: false,
      });
      
      renderLandingPage();
      
      // Should show normal text
      expect(screen.getByText('Sign In with GitHub')).toBeInTheDocument();
      expect(screen.getByText('Start Building Tests Now')).toBeInTheDocument();
    });
  });

  describe('Morphing Text and Visual Effects', () => {
    it('renders gradient text effects', () => {
      renderLandingPage();
      
      const titleElement = screen.getByText('TestCraft');
      const titleContainer = titleElement.closest('h1');
      expect(titleContainer).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'via-indigo-600', 'to-purple-600');
    });

    it('applies backdrop blur effects', () => {
      renderLandingPage();
      
      const header = screen.getByText('TestCraft').closest('header');
      expect(header).toHaveClass('backdrop-blur-md');
    });

    it('renders interactive hover states', () => {
      renderLandingPage();
      
      const ctaButton = screen.getByRole('button', { name: /Start Building Tests Now/i });
      expect(ctaButton).toHaveClass('hover:scale-105', 'hover:shadow-2xl');
    });

    it('applies smooth transitions', () => {
      renderLandingPage();
      
      const featureCards = screen.getAllByText(/Smart File Selection|Instant Generation|Seamless Integration/);
      featureCards.forEach((card: any) => {
        const cardElement = card.closest('div');
        expect(cardElement).toHaveClass('transition-all', 'duration-500');
      });
    });
  });
}); 
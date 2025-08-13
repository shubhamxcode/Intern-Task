import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MorphingText } from '../morphing-text';

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MorphingText Component', () => {
  const testTexts = ['Hello', 'World', 'TestCraft', 'AI'];

  describe('Component Rendering', () => {
    it('renders the morphing text container', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('relative', 'mx-auto', 'h-16', 'w-full', 'max-w-screen-md');
    });

    it('renders initial text correctly', () => {
      render(<MorphingText texts={testTexts} />);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('renders SVG filters for text effects', () => {
      render(<MorphingText texts={testTexts} />);
      
      const svg = document.querySelector('svg#filters');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('class', 'fixed h-0 w-0');
    });

    it('applies custom className when provided', () => {
      const customClass = 'custom-morphing-text';
      render(<MorphingText texts={testTexts} className={customClass} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass(customClass);
    });
  });

  describe('Text Morphing Logic', () => {
    it('initializes with first text in the array', () => {
      render(<MorphingText texts={testTexts} />);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('handles empty text array gracefully', () => {
      render(<MorphingText texts={[]} />);
      
      const container = screen.getByText('').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('handles single text gracefully', () => {
      render(<MorphingText texts={['Single Text']} />);
      
      expect(screen.getByText('Single Text')).toBeInTheDocument();
    });

    it('cycles through multiple texts', () => {
      render(<MorphingText texts={testTexts} />);
      
      // The component should cycle through all texts
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('Animation and Timing', () => {
    it('sets up requestAnimationFrame on mount', () => {
      render(<MorphingText texts={testTexts} />);
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('cleans up animation frame on unmount', () => {
      const { unmount } = render(<MorphingText texts={testTexts} />);
      
      unmount();
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('handles animation timing correctly', () => {
      render(<MorphingText texts={testTexts} />);
      
      // The component should set up continuous animation
      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Visual Effects and Styling', () => {
    it('applies blur filter effects', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass('[filter:url(#threshold)_blur(0.6px)]');
    });

    it('applies responsive text sizing', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass('text-[40pt]', 'lg:text-[6rem]');
    });

    it('applies proper font styling', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass('font-sans', 'font-bold', 'leading-none');
    });

    it('applies responsive height classes', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass('h-16', 'md:h-24');
    });
  });

  describe('SVG Filter Configuration', () => {
    it('renders threshold filter with correct values', () => {
      render(<MorphingText texts={testTexts} />);
      
      const filter = document.querySelector('filter#threshold');
      expect(filter).toBeInTheDocument();
      
      const feColorMatrix = filter?.querySelector('feColorMatrix');
      expect(feColorMatrix).toHaveAttribute('type', 'matrix');
      expect(feColorMatrix).toHaveAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140');
    });

    it('applies preserveAspectRatio to SVG', () => {
      render(<MorphingText texts={testTexts} />);
      
      const svg = document.querySelector('svg#filters');
      expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice');
    });
  });

  describe('Text Positioning and Layout', () => {
    it('positions text elements absolutely', () => {
      render(<MorphingText texts={testTexts} />);
      
      const textSpans = document.querySelectorAll('span');
      textSpans.forEach(span => {
        expect(span).toHaveClass('absolute', 'inset-x-0', 'top-0', 'm-auto', 'inline-block', 'w-full');
      });
    });

    it('maintains proper text alignment', () => {
      render(<MorphingText texts={testTexts} />);
      
      const container = screen.getByText('Hello').closest('div');
      expect(container).toHaveClass('text-center');
    });
  });

  describe('Performance and Memory Management', () => {
    it('uses refs for DOM manipulation', () => {
      render(<MorphingText texts={testTexts} />);
      
      // The component should use refs for efficient DOM access
      const textSpans = document.querySelectorAll('span');
      expect(textSpans.length).toBe(2); // Two text spans for morphing
    });

    it('implements proper cleanup on unmount', () => {
      const { unmount } = render(<MorphingText texts={testTexts} />);
      
      unmount();
      
      // Should clean up animation frame
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined texts gracefully', () => {
      render(<MorphingText texts={undefined as any} />);
      
      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });

    it('handles null texts gracefully', () => {
      render(<MorphingText texts={null as any} />);
      
      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });

    it('handles texts with special characters', () => {
      const specialTexts = ['Hello!', 'World@123', 'Test-Craft', 'AI & ML'];
      render(<MorphingText texts={specialTexts} />);
      
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });

    it('handles very long texts', () => {
      const longTexts = [
        'This is a very long text that might cause layout issues',
        'Another extremely long text that tests the component boundaries',
        'Short'
      ];
      render(<MorphingText texts={longTexts} />);
      
      expect(screen.getByText('This is a very long text that might cause layout issues')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper text contrast with filters', () => {
      render(<MorphingText texts={testTexts} />);
      
      // The threshold filter should maintain text readability
      const filter = document.querySelector('filter#threshold');
      expect(filter).toBeInTheDocument();
    });

    it('provides proper text content for screen readers', () => {
      render(<MorphingText texts={testTexts} />);
      
      const textElement = screen.getByText('Hello');
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toBe('Hello');
    });
  });
}); 
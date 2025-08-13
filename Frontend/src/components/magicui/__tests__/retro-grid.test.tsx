import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RetroGrid } from '../retro-grid';

describe('RetroGrid Component', () => {
  const defaultProps = {
    className: 'test-class',
    angle: 65,
    cellSize: 60,
    opacity: 0.5,
    lightLineColor: 'gray',
    darkLineColor: 'gray',
  };

  describe('Component Rendering', () => {
    it('renders the retro grid container', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const customClass = 'custom-retro-grid';
      render(<RetroGrid {...defaultProps} className={customClass} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass(customClass);
    });

    it('applies default classes', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass(
        'pointer-events-none',
        'absolute',
        'size-full',
        'overflow-hidden',
        '[perspective:200px]'
      );
    });
  });

  describe('Grid Properties and Styling', () => {
    it('applies custom angle', () => {
      render(<RetroGrid {...defaultProps} angle={45} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--grid-angle': '45deg' });
    });

    it('applies custom cell size', () => {
      render(<RetroGrid {...defaultProps} cellSize={80} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--cell-size': '80px' });
    });

    it('applies custom opacity', () => {
      render(<RetroGrid {...defaultProps} opacity={0.8} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--opacity': '0.8' });
    });

    it('applies custom light line color', () => {
      render(<RetroGrid {...defaultProps} lightLineColor="blue" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--light-line': 'blue' });
    });

    it('applies custom dark line color', () => {
      render(<RetroGrid {...defaultProps} darkLineColor="red" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--dark-line': 'red' });
    });

    it('applies opacity class based on CSS variable', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass('opacity-[var(--opacity)]');
    });
  });

  describe('Grid Structure and Layout', () => {
    it('renders grid background with proper transform', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('[transform*="rotateX"]');
      expect(gridBackground).toBeInTheDocument();
      expect(gridBackground).toHaveStyle({ transform: 'rotateX(65deg)' });
    });

    it('applies grid animation class', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('.animate-grid');
      expect(gridBackground).toBeInTheDocument();
    });

    it('renders grid lines with proper background image', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('.animate-grid');
      expect(gridBackground).toHaveClass('[background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)]');
    });

    it('applies grid sizing based on CSS variable', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('.animate-grid');
      expect(gridBackground).toHaveClass('[background-size:var(--cell-size)_var(--cell-size)]');
    });

    it('renders grid with proper dimensions', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('.animate-grid');
      expect(gridBackground).toHaveClass('[height:300vh]', '[width:600vw]');
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode grid lines', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gridBackground = document.querySelector('.animate-grid');
      expect(gridBackground).toHaveClass('dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]');
    });
  });

  describe('Gradient Overlay', () => {
    it('renders gradient overlay', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gradientOverlay = document.querySelector('.bg-gradient-to-t');
      expect(gradientOverlay).toBeInTheDocument();
      expect(gradientOverlay).toHaveClass('from-white', 'to-transparent', 'to-90%');
    });

    it('applies dark mode gradient', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const gradientOverlay = document.querySelector('.bg-gradient-to-t');
      expect(gradientOverlay).toHaveClass('dark:from-black');
    });
  });

  describe('Default Values', () => {
    it('uses default angle when not provided', () => {
      render(<RetroGrid className="test" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--grid-angle': '65deg' });
    });

    it('uses default cell size when not provided', () => {
      render(<RetroGrid className="test" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--cell-size': '60px' });
    });

    it('uses default opacity when not provided', () => {
      render(<RetroGrid className="test" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--opacity': '0.5' });
    });

    it('uses default colors when not provided', () => {
      render(<RetroGrid className="test" />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--light-line': 'gray' });
      expect(container).toHaveStyle({ '--dark-line': 'gray' });
    });
  });

  describe('CSS Custom Properties', () => {
    it('applies all CSS custom properties correctly', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({
        '--grid-angle': '65deg',
        '--cell-size': '60px',
        '--opacity': '0.5',
        '--light-line': 'gray',
        '--dark-line': 'gray',
      });
    });

    it('updates CSS custom properties when props change', () => {
      const { rerender } = render(<RetroGrid {...defaultProps} />);
      
      rerender(<RetroGrid {...defaultProps} angle={90} cellSize={100} opacity={0.9} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({
        '--grid-angle': '90deg',
        '--cell-size': '100px',
        '--opacity': '0.9',
      });
    });
  });

  describe('Accessibility and Performance', () => {
    it('applies pointer-events-none for performance', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass('pointer-events-none');
    });

    it('uses proper perspective for 3D effects', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass('[perspective:200px]');
    });

    it('handles overflow properly', () => {
      render(<RetroGrid {...defaultProps} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveClass('overflow-hidden');
    });
  });

  describe('Edge Cases', () => {
    it('handles extreme angle values', () => {
      render(<RetroGrid {...defaultProps} angle={180} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--grid-angle': '180deg' });
    });

    it('handles very small cell sizes', () => {
      render(<RetroGrid {...defaultProps} cellSize={1} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--cell-size': '1px' });
    });

    it('handles very large cell sizes', () => {
      render(<RetroGrid {...defaultProps} cellSize={1000} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--cell-size': '1000px' });
    });

    it('handles opacity at boundaries', () => {
      render(<RetroGrid {...defaultProps} opacity={0} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--opacity': '0' });
    });

    it('handles maximum opacity', () => {
      render(<RetroGrid {...defaultProps} opacity={1} />);
      
      const container = screen.getByText('RetroGrid Background').closest('div');
      expect(container).toHaveStyle({ '--opacity': '1' });
    });
  });
}); 
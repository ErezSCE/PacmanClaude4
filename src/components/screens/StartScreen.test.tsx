import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartScreen } from './StartScreen';

describe('StartScreen', () => {
  describe('[US-020#1] rendering', () => {
    it('should display the game title', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const title = screen.getByText('PAC-MAN');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('should display the high score label', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const label = screen.getByText('HIGH SCORE');
      expect(label).toBeInTheDocument();
    });

    it('should display the current high score value', () => {
      const mockOnStart = vi.fn();
      const highScore = 12345;
      render(<StartScreen highScore={highScore} onStart={mockOnStart} />);
      
      const value = screen.getByText('012345');
      expect(value).toBeInTheDocument();
    });

    it('should pad high score with leading zeros', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={100} onStart={mockOnStart} />);
      
      const value = screen.getByText('000100');
      expect(value).toBeInTheDocument();
    });

    it('should display the start button', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('PRESS START');
    });

    it('should display a hint about pressing Enter', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const hint = screen.getByText('or press ENTER');
      expect(hint).toBeInTheDocument();
    });
  });

  describe('[US-020#2] start control interaction', () => {
    it('should call onStart when start button is clicked', async () => {
      const mockOnStart = vi.fn();
      const user = userEvent.setup();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      await user.click(button);
      
      expect(mockOnStart).toHaveBeenCalledOnce();
    });

    it('should call onStart when Enter key is pressed on the button', async () => {
      const mockOnStart = vi.fn();
      const user = userEvent.setup();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnStart).toHaveBeenCalledOnce();
    });

    it('should call onStart when Space key is pressed on the button', async () => {
      const mockOnStart = vi.fn();
      const user = userEvent.setup();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      button.focus();
      await user.keyboard(' ');
      
      expect(mockOnStart).toHaveBeenCalledOnce();
    });
  });

  describe('[US-020#3] keyboard accessibility', () => {
    it('should have a visible focus indicator on the start button', async () => {
      const mockOnStart = vi.fn();
      const user = userEvent.setup();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      
      // Initially not focused
      expect(button).not.toHaveFocus();
      
      // Tab to focus the button
      await user.tab();
      
      // Button should now be focused
      expect(button).toHaveFocus();
    });

    it('should auto-focus the start button on mount', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      expect(button).toHaveFocus();
    });

    it('should have proper aria-label for accessibility', () => {
      const mockOnStart = vi.fn();
      render(<StartScreen highScore={0} onStart={mockOnStart} />);
      
      const button = screen.getByRole('button', { name: /start game/i });
      expect(button).toHaveAttribute('aria-label', 'Start game');
    });
  });
});

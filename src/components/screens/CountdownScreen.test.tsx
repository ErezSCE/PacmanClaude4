import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountdownScreen } from './CountdownScreen';

describe('CountdownScreen', () => {
  describe('[US-021#1] countdown sequence display', () => {
    it('should display 3 initially', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('3');
    });

    it('should display 2 when count is 2', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={2} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('2');
    });

    it('should display 1 when count is 1', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={1} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('1');
    });

    it('should display GO! when count is 0 or less', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={0} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('GO!');
    });

    it('should have aria-live polite on the countdown display', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveAttribute('aria-live', 'polite');
    });

    it('should display the countdown screen container', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const screen_element = screen.getByTestId('countdown-screen');
      expect(screen_element).toBeInTheDocument();
    });

    it('should display the "Get ready..." hint', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const hint = screen.getByText('Get ready...');
      expect(hint).toBeInTheDocument();
    });

    it('should display countdown numbers in correct sequence (3, 2, 1, GO)', () => {
      const mockOnSkip = vi.fn();

      // Start with 3
      const { rerender } = render(<CountdownScreen count={3} onSkip={mockOnSkip} />);
      expect(screen.getByRole('heading')).toHaveTextContent('3');

      // Update to 2
      rerender(<CountdownScreen count={2} onSkip={mockOnSkip} />);
      expect(screen.getByRole('heading')).toHaveTextContent('2');

      // Update to 1
      rerender(<CountdownScreen count={1} onSkip={mockOnSkip} />);
      expect(screen.getByRole('heading')).toHaveTextContent('1');

      // Update to 0 (GO!)
      rerender(<CountdownScreen count={0} onSkip={mockOnSkip} />);
      expect(screen.getByRole('heading')).toHaveTextContent('GO!');
    });

    it('should update display when count prop changes', () => {
      const mockOnSkip = vi.fn();
      const { rerender } = render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('3');

      rerender(<CountdownScreen count={2} onSkip={mockOnSkip} />);
      expect(heading).toHaveTextContent('2');
    });

    it('should handle negative count values and display GO!', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={-1} onSkip={mockOnSkip} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('GO!');
    });
  });

  describe('[US-021#2] countdown timing and transition', () => {
    it('should call onSkip when skip button is clicked', async () => {
      const mockOnSkip = vi.fn();
      const user = userEvent.setup();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalledOnce();
    });

    it('should have a skip button that is keyboard accessible', async () => {
      const mockOnSkip = vi.fn();
      const user = userEvent.setup();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      skipButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSkip).toHaveBeenCalledOnce();
    });

    it('should auto-focus the skip button on mount', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).toHaveFocus();
    });

    it('should have the focusable class on the skip button', () => {
      const mockOnSkip = vi.fn();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).toHaveClass('focusable');
    });

    it('should call onSkip when Space key is pressed on the button', async () => {
      const mockOnSkip = vi.fn();
      const user = userEvent.setup();
      render(<CountdownScreen count={3} onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      skipButton.focus();
      await user.keyboard(' ');

      expect(mockOnSkip).toHaveBeenCalledOnce();
    });
  });
});

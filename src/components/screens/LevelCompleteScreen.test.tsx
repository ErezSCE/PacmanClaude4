import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LevelCompleteScreen } from './LevelCompleteScreen';

describe('LevelCompleteScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[US-023#1] renders the level complete message', () => {
    const mockOnComplete = vi.fn();
    render(
      <LevelCompleteScreen
        level={1}
        score={1200}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/level complete/i)).toBeInTheDocument();
    expect(screen.getByText(/level 1/i)).toBeInTheDocument();
    expect(screen.getByText(/1200/)).toBeInTheDocument();
  });

  it('[US-023#2] displays the current level number', () => {
    const mockOnComplete = vi.fn();
    render(
      <LevelCompleteScreen
        level={5}
        score={5000}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/level 5/i)).toBeInTheDocument();
  });

  it('[US-023#3] displays the current score', () => {
    const mockOnComplete = vi.fn();
    render(
      <LevelCompleteScreen
        level={2}
        score={2500}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/2500/)).toBeInTheDocument();
  });

  it('[US-023#4] automatically transitions to next level after fixed duration', async () => {
    const mockOnComplete = vi.fn();
    const DISPLAY_DURATION = 3000; // 3 seconds

    render(
      <LevelCompleteScreen
        level={1}
        score={1200}
        onComplete={mockOnComplete}
      />
    );

    expect(mockOnComplete).not.toHaveBeenCalled();

    // Fast-forward time to just before the transition
    vi.advanceTimersByTime(DISPLAY_DURATION - 100);
    expect(mockOnComplete).not.toHaveBeenCalled();

    // Fast-forward to trigger the transition
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledOnce();
    });
  });

  it('[US-023#5] calls onComplete callback with next level number', async () => {
    const mockOnComplete = vi.fn();
    const DISPLAY_DURATION = 3000;

    render(
      <LevelCompleteScreen
        level={3}
        score={3000}
        onComplete={mockOnComplete}
      />
    );

    vi.advanceTimersByTime(DISPLAY_DURATION);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(4);
    });
  });

  it('[US-023#6] cleans up timer on unmount', () => {
    const mockOnComplete = vi.fn();
    const { unmount } = render(
      <LevelCompleteScreen
        level={1}
        score={1200}
        onComplete={mockOnComplete}
      />
    );

    unmount();

    // Advance timers past the display duration
    vi.advanceTimersByTime(5000);

    // onComplete should not be called after unmount
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PauseOverlay } from './PauseOverlay';
import { InputManager } from '../../input/InputManager';

describe('PauseOverlay', () => {
  describe('[US-022#1] shows a Paused overlay while the game loop is frozen', () => {
    it('renders a "Paused" heading', () => {
      render(
        <PauseOverlay muted={false} onResume={vi.fn()} onToggleMute={vi.fn()} onQuit={vi.fn()} />,
      );

      expect(screen.getByRole('heading', { name: 'Paused' })).toBeInTheDocument();
    });

    it('exposes the overlay as an accessible dialog', () => {
      render(
        <PauseOverlay muted={false} onResume={vi.fn()} onToggleMute={vi.fn()} onQuit={vi.fn()} />,
      );

      const dialog = screen.getByRole('dialog', { name: 'Paused' });
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('[US-022#2] resuming from the overlay hands control back to the game', () => {
    it('calls onResume when the Resume button is clicked', async () => {
      const onResume = vi.fn();
      const user = userEvent.setup();
      render(
        <PauseOverlay muted={false} onResume={onResume} onToggleMute={vi.fn()} onQuit={vi.fn()} />,
      );

      await user.click(screen.getByRole('button', { name: 'Resume' }));

      expect(onResume).toHaveBeenCalledOnce();
    });

    it('auto-focuses the Resume button so Enter/Space also resumes', async () => {
      const onResume = vi.fn();
      const user = userEvent.setup();
      render(
        <PauseOverlay muted={false} onResume={onResume} onToggleMute={vi.fn()} onQuit={vi.fn()} />,
      );

      const resumeButton = screen.getByRole('button', { name: 'Resume' });
      expect(resumeButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onResume).toHaveBeenCalledOnce();
    });
  });

  describe('[US-022#3] the pause/resume binding is identical for keyboard and on-screen control', () => {
    it('invokes the same togglePause handler from an Escape/P keypress and from the on-screen Resume button', async () => {
      const togglePause = vi.fn();
      const user = userEvent.setup();

      // Keyboard path: InputManager normalizes Escape/P into onTogglePause.
      const inputManager = new InputManager({ onTogglePause: togglePause });
      inputManager.simulateKeyDown({ key: 'Escape', preventDefault: () => undefined });
      expect(togglePause).toHaveBeenCalledTimes(1);

      // On-screen control path: PauseOverlay's Resume button is wired to
      // the very same handler by the composing screen.
      render(
        <PauseOverlay muted={false} onResume={togglePause} onToggleMute={vi.fn()} onQuit={vi.fn()} />,
      );
      await user.click(screen.getByRole('button', { name: 'Resume' }));

      expect(togglePause).toHaveBeenCalledTimes(2);
    });

    it('also triggers the shared handler via the "P" key binding', () => {
      const togglePause = vi.fn();
      const inputManager = new InputManager({ onTogglePause: togglePause });

      inputManager.simulateKeyDown({ key: 'p', preventDefault: () => undefined });

      expect(togglePause).toHaveBeenCalledOnce();
    });
  });

  describe('mute toggle and quit controls', () => {
    it('calls onToggleMute when Mute button is clicked and reflects muted state', async () => {
      const onToggleMute = vi.fn();
      const user = userEvent.setup();
      render(
        <PauseOverlay muted={true} onResume={vi.fn()} onToggleMute={onToggleMute} onQuit={vi.fn()} />,
      );

      const muteButton = screen.getByRole('button', { name: 'Unmute' });
      expect(muteButton).toHaveAttribute('aria-pressed', 'true');

      await user.click(muteButton);
      expect(onToggleMute).toHaveBeenCalledOnce();
    });

    it('calls onQuit when the Quit button is clicked', async () => {
      const onQuit = vi.fn();
      const user = userEvent.setup();
      render(
        <PauseOverlay muted={false} onResume={vi.fn()} onToggleMute={vi.fn()} onQuit={onQuit} />,
      );

      await user.click(screen.getByRole('button', { name: 'Quit to Start' }));
      expect(onQuit).toHaveBeenCalledOnce();
    });
  });
});

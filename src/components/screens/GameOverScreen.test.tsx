import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameOverScreen } from './GameOverScreen';

describe('GameOverScreen', () => {
  it('[US-024#1] displays the final score', () => {
    render(<GameOverScreen score={4560} isHighScore={false} onRestart={vi.fn()} />);
    expect(screen.getByTestId('final-score')).toHaveTextContent('4560');
  });

  it('[US-024#2] shows a required 3-letter initials input when the score qualifies', () => {
    render(<GameOverScreen score={99999} isHighScore={true} onRestart={vi.fn()} onSubmitInitials={vi.fn()} />);
    expect(screen.getByLabelText(/enter your initials/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /play again/i })).not.toBeInTheDocument();
  });

  it('[US-024#2] requires exactly 3 letters before restart is offered, then reveals restart on valid submit', async () => {
    const user = userEvent.setup();
    const onSubmitInitials = vi.fn();
    render(<GameOverScreen score={99999} isHighScore={true} onRestart={vi.fn()} onSubmitInitials={onSubmitInitials} />);

    const input = screen.getByLabelText(/enter your initials/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(input, 'AB');
    await user.click(submitButton);
    expect(screen.getByRole('alert')).toHaveTextContent(/exactly 3 letters/i);
    expect(screen.queryByRole('button', { name: /play again/i })).not.toBeInTheDocument();
    expect(onSubmitInitials).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'ace');
    await user.click(submitButton);

    expect(onSubmitInitials).toHaveBeenCalledWith('ACE');
    expect(screen.queryByLabelText(/enter your initials/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
  });

  it('[US-024#3] shows restart immediately with no initials prompt when the score does not qualify', () => {
    render(<GameOverScreen score={10} isHighScore={false} onRestart={vi.fn()} />);
    expect(screen.queryByLabelText(/enter your initials/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
  });

  it('[US-024#4] invokes onRestart when restart is clicked for a non-qualifying score', async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    render(<GameOverScreen score={10} isHighScore={false} onRestart={onRestart} />);
    await user.click(screen.getByRole('button', { name: /play again/i }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('[US-024#4] invokes onRestart when restart is clicked after a qualifying score has valid initials submitted', async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    render(<GameOverScreen score={50000} isHighScore={true} onRestart={onRestart} onSubmitInitials={vi.fn()} />);

    await user.type(screen.getByLabelText(/enter your initials/i), 'ZZZ');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    const restartButton = screen.getByRole('button', { name: /play again/i });
    await user.click(restartButton);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});

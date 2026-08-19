import { useState } from 'react';
import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface GameOverScreenProps {
  score: number;
  isHighScore: boolean;
  onSubmitInitials: (initials: string) => void;
  onRestart: () => void;
}

/**
 * Game Over screen. When the run qualifies as a high score, a 3-letter
 * initials input plus Submit button are shown first in tab order; the
 * Restart button is always reachable and keyboard-operable.
 */
export function GameOverScreen({
  score,
  isHighScore,
  onSubmitInitials,
  onRestart,
}: GameOverScreenProps): JSX.Element {
  const [initials, setInitials] = useState('');
  const primaryRef = useAutoFocus<HTMLInputElement | HTMLButtonElement>();

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (initials.trim().length > 0) {
      onSubmitInitials(initials.trim().toUpperCase().slice(0, 3));
    }
  };

  return (
    <div className="screen" data-testid="game-over-screen">
      <h2>Game Over</h2>
      <p>Score: {score}</p>
      {isHighScore ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="initials-input">New high score! Enter your initials:</label>
          <input
            id="initials-input"
            ref={primaryRef as React.RefObject<HTMLInputElement>}
            className="focusable"
            type="text"
            maxLength={3}
            value={initials}
            onChange={(event) => setInitials(event.target.value)}
            autoFocus
          />
          <button type="submit" className="focusable primary-button">
            Submit
          </button>
        </form>
      ) : null}
      <button
        ref={isHighScore ? undefined : (primaryRef as React.RefObject<HTMLButtonElement>)}
        type="button"
        className="focusable"
        onClick={onRestart}
        autoFocus={!isHighScore}
      >
        Play Again
      </button>
    </div>
  );
}

import { useState, type FormEvent, type RefObject } from 'react';
import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface GameOverScreenProps {
  /** The player's final score for the completed run. */
  score: number;
  /** Whether the final score qualifies for the top-10 high score list. */
  isHighScore: boolean;
  /** Invoked when the player chooses to restart (returns to Start/Countdown). */
  onRestart: () => void;
  /** Invoked with the validated 3-letter initials once submitted (only relevant when isHighScore is true). */
  onSubmitInitials?: (initials: string) => void;
}

const INITIALS_LENGTH = 3;
const INITIALS_PATTERN = /^[A-Za-z]{3}$/;

export function GameOverScreen({
  score,
  isHighScore,
  onRestart,
  onSubmitInitials,
}: GameOverScreenProps): JSX.Element {
  const [initials, setInitials] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryRef = useAutoFocus<HTMLInputElement | HTMLButtonElement>();

  const showInitialsForm = isHighScore && !submitted;
  const showRestart = !isHighScore || submitted;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const normalized = initials.trim().toUpperCase();
    if (!INITIALS_PATTERN.test(normalized)) {
      setError(`Enter exactly ${INITIALS_LENGTH} letters.`);
      return;
    }
    setError(null);
    setSubmitted(true);
    onSubmitInitials?.(normalized);
  };

  return (
    <div className="game-over-screen" role="dialog" aria-labelledby="game-over-heading">
      <h1 id="game-over-heading">Game Over</h1>
      <p data-testid="final-score">Final Score: {score}</p>

      {showInitialsForm && (
        <form onSubmit={handleSubmit} aria-label="High score initials entry">
          <label htmlFor="initials-input">New high score! Enter your initials:</label>
          <input
            id="initials-input"
            ref={primaryRef as RefObject<HTMLInputElement>}
            className="focus-visible"
            type="text"
            maxLength={INITIALS_LENGTH}
            value={initials}
            onChange={(event) => setInitials(event.target.value.toUpperCase())}
            required
            pattern="[A-Za-z]{3}"
            aria-required="true"
            aria-describedby={error ? 'initials-error' : undefined}
          />
          {error && (
            <p id="initials-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="focus-visible">
            Submit
          </button>
        </form>
      )}

      {showRestart && (
        <button
          type="button"
          ref={showInitialsForm ? undefined : (primaryRef as RefObject<HTMLButtonElement>)}
          className="focus-visible"
          onClick={onRestart}
        >
          Play Again
        </button>
      )}
    </div>
  );
}

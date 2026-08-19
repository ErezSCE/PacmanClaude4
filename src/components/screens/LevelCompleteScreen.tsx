import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface LevelCompleteScreenProps {
  level: number;
  score: number;
  onContinue: () => void;
}

/**
 * Level Complete screen: a single primary action (Continue) that is
 * auto-focused and keyboard-activatable.
 */
export function LevelCompleteScreen({ level, score, onContinue }: LevelCompleteScreenProps): JSX.Element {
  const continueButtonRef = useAutoFocus<HTMLButtonElement>();

  return (
    <div className="screen" data-testid="level-complete-screen">
      <h2>Level {level} Complete!</h2>
      <p>Score: {score}</p>
      <button ref={continueButtonRef} type="button" className="focusable primary-button" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

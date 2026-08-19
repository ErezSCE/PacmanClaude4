import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface CountdownScreenProps {
  count: number;
  onSkip: () => void;
}

/**
 * Countdown screen shown between Start and Playing. The only interactive
 * control (Skip) is keyboard reachable and auto-focused so a keyboard-only
 * player is never stuck waiting on a screen with no visible focus target.
 */
export function CountdownScreen({ count, onSkip }: CountdownScreenProps): JSX.Element {
  const skipButtonRef = useAutoFocus<HTMLButtonElement>();

  return (
    <div className="screen" data-testid="countdown-screen">
      <p className="hint">Get ready...</p>
      <h2 aria-live="polite">{count > 0 ? count : 'GO!'}</h2>
      <button ref={skipButtonRef} type="button" className="focusable" onClick={onSkip}>
        Skip
      </button>
    </div>
  );
}

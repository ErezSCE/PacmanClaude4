import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface PauseOverlayProps {
  muted: boolean;
  onResume: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
}

/**
 * Pause overlay: Resume, Mute toggle and Quit are all native buttons,
 * reachable via Tab and activated with Enter/Space, matching the same
 * keyboard bindings (P/Esc to resume, M to mute) available in-game.
 */
export function PauseOverlay({ muted, onResume, onToggleMute, onQuit }: PauseOverlayProps): JSX.Element {
  const resumeButtonRef = useAutoFocus<HTMLButtonElement>();

  return (
    <div className="screen" role="dialog" aria-label="Paused" data-testid="pause-overlay">
      <h2>Paused</h2>
      <button ref={resumeButtonRef} type="button" className="focusable primary-button" onClick={onResume}>
        Resume
      </button>
      <button type="button" className="focusable" onClick={onToggleMute} aria-pressed={muted}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <button type="button" className="focusable" onClick={onQuit}>
        Quit to Start
      </button>
      <p className="hint">Press P or Esc to resume, M to mute.</p>
    </div>
  );
}

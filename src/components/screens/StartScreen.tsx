import { useState } from 'react';
import { useAutoFocus } from '../../hooks/useAutoFocus';
import '../../styles/focus.css';

export interface StartScreenProps {
  onStart: () => void;
  highScore?: number;
  colorblindPaletteEnabled?: boolean;
  onToggleColorblindPalette?: (enabled: boolean) => void;
}

/**
 * Start screen: entry point of the game. Every control is a native,
 * keyboard-operable element (button/checkbox) so Tab/Enter/Space works
 * without any extra key handling.
 */
export function StartScreen({
  onStart,
  highScore = 0,
  colorblindPaletteEnabled = false,
  onToggleColorblindPalette,
}: StartScreenProps): JSX.Element {
  const startButtonRef = useAutoFocus<HTMLButtonElement>();
  const [colorblind, setColorblind] = useState(colorblindPaletteEnabled);

  const handleToggle = (): void => {
    const next = !colorblind;
    setColorblind(next);
    onToggleColorblindPalette?.(next);
  };

  return (
    <div className="screen" data-testid="start-screen">
      <h1>PAC-MAN</h1>
      <p className="hint">High Score: {highScore}</p>
      <button
        ref={startButtonRef}
        type="button"
        className="focusable primary-button"
        onClick={onStart}
        autoFocus
      >
        Start Game
      </button>
      <label className="focusable" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          className="focusable"
          checked={colorblind}
          onChange={handleToggle}
        />
        Colorblind-friendly ghost palette
      </label>
      <p className="hint">Use arrow keys or WASD to move. P/Esc to pause. M to mute.</p>
    </div>
  );
}

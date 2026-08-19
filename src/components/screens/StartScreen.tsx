import { useRef, useEffect } from 'react';
import { useAutoFocus } from '../../hooks/useAutoFocus';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export function StartScreen({ highScore, onStart }: StartScreenProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useAutoFocus(buttonRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && buttonRef.current === document.activeElement) {
        e.preventDefault();
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  const formattedScore = String(highScore).padStart(6, '0');

  return (
    <div className="start-screen">
      <h1>PAC-MAN</h1>
      
      <div className="high-score-section">
        <div className="high-score-label">HIGH SCORE</div>
        <div className="high-score-value">{formattedScore}</div>
      </div>

      <button
        ref={buttonRef}
        className="start-button"
        onClick={onStart}
        aria-label="Start game"
      >
        PRESS START
      </button>
      
      <div className="start-hint">or press ENTER</div>
    </div>
  );
}

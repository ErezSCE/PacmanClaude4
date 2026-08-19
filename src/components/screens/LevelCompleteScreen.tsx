import { useEffect } from 'react';
import '../styles/LevelCompleteScreen.css';

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  onComplete: (nextLevel: number) => void;
}

const DISPLAY_DURATION = 3000; // 3 seconds

export function LevelCompleteScreen({
  level,
  score,
  onComplete,
}: LevelCompleteScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(level + 1);
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [level, onComplete]);

  return (
    <div className="level-complete-screen">
      <div className="level-complete-content">
        <h1 className="level-complete-title">Level Complete!</h1>
        <div className="level-complete-info">
          <p className="level-complete-level">Level {level}</p>
          <p className="level-complete-score">Score: {score}</p>
        </div>
        <p className="level-complete-message">Get ready for the next level...</p>
      </div>
    </div>
  );
}

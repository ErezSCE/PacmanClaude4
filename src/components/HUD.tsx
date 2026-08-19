import React, { useState, useEffect } from 'react';
import { ScoreService } from '../services/ScoreService';

interface HUDProps {
  scoreService: ScoreService;
}

/**
 * HUD component that displays the live score.
 * Subscribes to ScoreService score changes and updates on each change event.
 */
export const HUD: React.FC<HUDProps> = ({ scoreService }) => {
  const [score, setScore] = useState(scoreService.getScore());

  useEffect(() => {
    // Subscribe to score changes
    const unsubscribe = scoreService.subscribe((newScore) => {
      setScore(newScore);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [scoreService]);

  return (
    <div className="hud">
      <div className="hud-score">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score.toString().padStart(6, '0')}</span>
      </div>
    </div>
  );
};

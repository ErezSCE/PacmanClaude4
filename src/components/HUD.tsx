import React, { useEffect, useState } from 'react';
import { ScoreService } from '../services/ScoreService';
import { GameStateMachine } from '../engine/state/GameStateMachine';

interface HUDProps {
  scoreService: ScoreService;
  gameStateMachine: GameStateMachine;
}

/**
 * HUD component that displays the live score and remaining lives.
 * Subscribes to ScoreService for score updates and GameStateMachine for lives updates.
 */
export const HUD: React.FC<HUDProps> = ({ scoreService, gameStateMachine }) => {
  const [score, setScore] = useState(scoreService.getScore());
  const [lives, setLives] = useState(gameStateMachine.getLives());

  useEffect(() => {
    const handleScoreChange = () => {
      setScore(scoreService.getScore());
    };

    return scoreService.subscribe(handleScoreChange);
  }, [scoreService]);

  useEffect(() => {
    const handleStateChange = () => {
      setLives(gameStateMachine.getLives());
    };

    return gameStateMachine.subscribe(handleStateChange);
  }, [gameStateMachine]);

  return (
    <div className="hud">
      <div className="hud-score">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score.toString().padStart(6, '0')}</span>
      </div>
      <div className="hud-lives">
        <span className="hud-label">LIVES</span>
        <div className="hud-lives-icons">
          {Array.from({ length: lives }).map((_, index) => (
            <span key={index} className="hud-life-icon" aria-label={`Life ${index + 1}`}>
              ●
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

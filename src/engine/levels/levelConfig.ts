import { LevelConfig } from '../../types';

/** Return difficulty configuration for the given level number. */
export function getLevelConfig(level: number): LevelConfig {
  return {
    level,
    ghostSpeed: Math.min(0.75 + level * 0.02, 0.95),
    pacmanSpeed: Math.min(0.8 + level * 0.02, 1.0),
    frightenedTime: Math.max(6 - (level - 1) * 0.5, 0),
    dotScore: 10,
    pelletScore: 50,
  };
}

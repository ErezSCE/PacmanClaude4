import { LevelConfig } from '../../types';

/**
 * Return difficulty configuration for the given level number.
 * NOTE: Placeholder deterministic scaling — full tuning owned by the
 * level-scaling feature assignment. Values are clamped/capped so behavior
 * repeats at a ceiling for level 20+ per NFR requirements.
 */
export function getLevelConfig(level: number): LevelConfig {
  const cappedLevel = Math.max(1, level);
  return {
    level: cappedLevel,
    pacmanSpeed: Math.min(0.8 + cappedLevel * 0.02, 1.0),
    ghostSpeed: Math.min(0.75 + cappedLevel * 0.02, 0.95),
    frightenedSpeed: Math.min(0.5 + cappedLevel * 0.01, 0.6),
    frightenedTime: Math.max(6 - (cappedLevel - 1) * 0.5, 1),
    scatterTime: Math.max(7 - (cappedLevel - 1) * 0.2, 3),
    chaseTime: Math.min(20 + (cappedLevel - 1) * 1, 40),
    elroyDotsLeft: Math.max(20 - cappedLevel, 5),
    elroySpeed: Math.min(0.85 + cappedLevel * 0.02, 1.05),
  };
}

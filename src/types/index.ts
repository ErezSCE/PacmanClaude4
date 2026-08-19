/**
 * Shared type declarations used across the engine and UI layers.
 * NOTE: this file is part of the frozen shared contract — once the
 * canonical engine/domain shapes are finalized here, downstream modules
 * must not redefine them locally.
 */

export type Tile = 'wall' | 'empty' | 'dot' | 'pellet' | 'tunnel' | 'door' | 'house';

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export type GhostMode = 'chase' | 'scatter' | 'scared' | 'eaten';

export interface GameConfig {
  startingLives: number;
  extraLifeScoreThreshold: number;
}

export interface LevelConfig {
  level: number;
  pacmanSpeed: number;
  ghostSpeed: number;
  scatterDurationMs: number;
  chaseDurationMs: number;
  scaredDurationMs: number;
}

export interface HighScoreEntry {
  id: string;
  initials: string;
  score: number;
  achievedAt: string;
}

export interface GameSnapshot {
  score: number;
  lives: number;
  level: number;
  dotsRemaining: number;
}

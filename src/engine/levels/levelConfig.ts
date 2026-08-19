/**
 * Deterministic per-level difficulty configuration table. Levels beyond
 * `MAX_CONFIGURED_LEVEL` repeat the highest configured tier's difficulty
 * parameters (repeat-at-cap behavior) rather than continuing to scale
 * speeds/timers indefinitely.
 */
import type { LevelConfig } from '../../types';

/** Ghosts scatter to their home corners for 7 seconds per phase. */
const SCATTER_DURATION_MS = 7000;

/** Ghosts chase Pac-Man for 20 seconds per phase. */
const CHASE_DURATION_MS = 20000;

/** Base "frightened" duration at level 1, shrinking as levels increase. */
const BASE_SCARED_DURATION_MS = 6000;

/** Amount the scared duration shrinks per additional level. */
const SCARED_DURATION_DECAY_MS = 500;

/** Scared mode never shrinks below this floor, keeping it always usable. */
const MIN_SCARED_DURATION_MS = 1000;

/** Base Pac-Man movement speed (tiles/tick multiplier) at level 1. */
const BASE_PACMAN_SPEED = 0.8;

/** Base ghost movement speed (tiles/tick multiplier) at level 1. */
const BASE_GHOST_SPEED = 0.75;

/** Speed gained per level, applied to both Pac-Man and ghosts. */
const SPEED_INCREMENT_PER_LEVEL = 0.02;

/** Neither Pac-Man nor ghosts ever exceed this speed multiplier. */
const MAX_SPEED = 1;

/** Highest level with a distinct difficulty tier; later levels repeat it. */
const MAX_CONFIGURED_LEVEL = 20;

/**
 * Returns the difficulty parameters (speeds, mode-timer durations) for the
 * given level. Levels are clamped to at least 1, and levels above
 * `MAX_CONFIGURED_LEVEL` reuse that tier's scaling so difficulty is
 * deterministic and stops escalating past the cap.
 *
 * @param level - The 1-based level number to compute a configuration for.
 */
export function getLevelConfig(level: number): LevelConfig {
  const effectiveLevel = Math.min(Math.max(Math.trunc(level), 1), MAX_CONFIGURED_LEVEL);
  const speedProgress = (effectiveLevel - 1) * SPEED_INCREMENT_PER_LEVEL;

  const pacmanSpeed = Math.min(BASE_PACMAN_SPEED + speedProgress, MAX_SPEED);
  const ghostSpeed = Math.min(BASE_GHOST_SPEED + speedProgress, MAX_SPEED);

  const scaredDurationMs = Math.max(
    BASE_SCARED_DURATION_MS - (effectiveLevel - 1) * SCARED_DURATION_DECAY_MS,
    MIN_SCARED_DURATION_MS,
  );

  return {
    level,
    pacmanSpeed,
    ghostSpeed,
    scatterDurationMs: SCATTER_DURATION_MS,
    chaseDurationMs: CHASE_DURATION_MS,
    scaredDurationMs,
  };
}

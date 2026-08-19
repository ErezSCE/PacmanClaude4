/**
 * Tracks staggered ghost-house release: at level/life start only Blinky
 * exits immediately while Pinky, Inky, and Clyde are held in the ghost
 * house and released one at a time after their configured delays elapse.
 * Release state is purely time-based (elapsed milliseconds since the last
 * `reset()`), so repeated `tick()` calls with the same total elapsed time
 * always yield the same release state regardless of how the ticks are
 * chunked.
 */
import type { GhostName } from './entities/Ghost';

/** Per-ghost release delay (in milliseconds) since level/life start. */
export interface GhostReleaseConfig {
  blinky: number;
  pinky: number;
  inky: number;
  clyde: number;
}

/** Default staggered release delays used when no level-specific config is supplied. */
export const DEFAULT_GHOST_RELEASE_CONFIG: GhostReleaseConfig = {
  blinky: 0,
  pinky: 2000,
  inky: 4000,
  clyde: 6000,
};

/**
 * Governs which ghosts are still confined to the ghost house and which
 * have been released to roam the maze, based on elapsed time.
 */
export class GhostHouse {
  private readonly ghostNames: GhostName[];
  private readonly releaseConfig: GhostReleaseConfig;
  private elapsedMs = 0;

  constructor(ghosts: { name: GhostName }[], releaseConfig: GhostReleaseConfig) {
    this.ghostNames = ghosts.map((ghost) => ghost.name);
    this.releaseConfig = releaseConfig;
  }

  /** Advances the release timer by `deltaMs` milliseconds. */
  tick(deltaMs: number): void {
    this.elapsedMs += deltaMs;
  }

  /** Whether the named ghost has been released from the ghost house. */
  isReleased(name: GhostName): boolean {
    return this.elapsedMs >= this.releaseConfig[name];
  }

  /** All ghosts currently released, in `ghosts` array order. */
  getReleasedGhosts(): GhostName[] {
    return this.ghostNames.filter((name) => this.isReleased(name));
  }

  /** Reinitializes release state for a new level/life; only Blinky is released again. */
  reset(): void {
    this.elapsedMs = 0;
  }
}

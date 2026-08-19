/**
 * Ghost house release manager. Tracks which ghosts are still confined to the
 * ghost house and releases them one at a time after configured delays.
 *
 * Release order is deterministic: Blinky -> Pinky -> Inky -> Clyde.
 * Each ghost is released after its configured delay (in milliseconds) elapses
 * from the start of the level/life.
 */
import type { GhostName } from './entities/Ghost';

/** Configuration for a single ghost's release timing. */
export interface GhostReleaseConfig {
  /** The ghost to release. */
  name: GhostName;
  /** Delay in milliseconds before this ghost is released from the house. */
  delayMs: number;
}

/**
 * Manages the staggered release of ghosts from the ghost house.
 * Tracks elapsed time and determines which ghosts are still confined.
 */
export class GhostHouse {
  private readonly releaseConfigs: GhostReleaseConfig[];
  private releasedGhosts = new Set<GhostName>();
  private elapsedMs = 0;

  /**
   * Creates a new ghost house manager.
   *
   * @param releaseConfigs - Array of release configurations in order.
   *   Typically: Blinky (0ms), Pinky (5000ms), Inky (10000ms), Clyde (15000ms).
   */
  constructor(releaseConfigs: GhostReleaseConfig[]) {
    this.releaseConfigs = releaseConfigs;
    // Blinky is always released immediately (delay 0).
    const blinkyConfig = releaseConfigs.find((c) => c.name === 'blinky');
    if (blinkyConfig && blinkyConfig.delayMs === 0) {
      this.releasedGhosts.add('blinky');
    }
  }

  /**
   * Advances the ghost house timer by `deltaMs` milliseconds and releases
   * any ghosts whose configured delay has elapsed.
   *
   * @param deltaMs - Time elapsed since the last tick, in milliseconds.
   */
  tick(deltaMs: number): void {
    this.elapsedMs += deltaMs;

    for (const config of this.releaseConfigs) {
      if (!this.releasedGhosts.has(config.name) && this.elapsedMs >= config.delayMs) {
        this.releasedGhosts.add(config.name);
      }
    }
  }

  /**
   * Checks whether the named ghost has been released from the ghost house.
   *
   * @param ghostName - The ghost to check.
   * @returns True if the ghost has been released; false if still confined.
   */
  isReleased(ghostName: GhostName): boolean {
    return this.releasedGhosts.has(ghostName);
  }

  /**
   * Resets the ghost house to its initial state (all ghosts except Blinky
   * confined, timer at zero). Called when a new level/life begins.
   */
  reset(): void {
    this.releasedGhosts.clear();
    this.elapsedMs = 0;
    // Re-release Blinky immediately.
    const blinkyConfig = this.releaseConfigs.find((c) => c.name === 'blinky');
    if (blinkyConfig && blinkyConfig.delayMs === 0) {
      this.releasedGhosts.add('blinky');
    }
  }

  /**
   * Returns the current elapsed time in milliseconds since the ghost house
   * was initialized or reset. Useful for testing and debugging.
   */
  getElapsedMs(): number {
    return this.elapsedMs;
  }

  /**
   * Returns the set of ghosts that have been released so far.
   * Useful for testing and debugging.
   */
  getReleasedGhosts(): Set<GhostName> {
    return new Set(this.releasedGhosts);
  }
}

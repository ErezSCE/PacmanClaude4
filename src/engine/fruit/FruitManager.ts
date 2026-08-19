import {
  FRUIT_CONFIG_TABLE,
  getFruitConfigForLevel,
  getLevelConfig,
  type FruitConfig,
} from '../levels/levelConfig';

/**
 * Represents a spawned fruit with its position and despawn timer.
 */
export interface SpawnedFruit {
  type: string;
  row: number;
  col: number;
  points: number;
  spawnedAt: number; // timestamp in ms
  despawnTimeoutMs: number; // how long until it despawns
}

/**
 * FruitManager handles fruit spawning logic based on dot-count thresholds
 * and despawn timeout management.
 *
 * Fruit spawns near specific dot-count milestones (~70 and ~170 dots eaten)
 * and despawns after a configured timeout if not collected.
 */
export class FruitManager {
  private currentFruit: SpawnedFruit | null = null;
  private totalDotsEaten: number = 0;
  private spawnedAtThresholds: Set<number> = new Set();
  private level: number;

  constructor(level: number = 1) {
    this.level = level;
  }

  /**
   * Record dots eaten and check if fruit should spawn.
   * Spawns fruit at configured thresholds (e.g., 70 and 170 dots).
   *
   * @param dotsEaten Total dots eaten in the current level
   * @returns The spawned fruit if one was just created, null otherwise
   */
  recordDotsEaten(dotsEaten: number): SpawnedFruit | null {
    this.totalDotsEaten = dotsEaten;
    const levelConfig = getLevelConfig(this.level);
    const spawnThresholds = levelConfig.fruitSpawnThresholds || [70, 170];

    // Check if we've crossed a spawn threshold for the first time
    for (const threshold of spawnThresholds) {
      if (dotsEaten >= threshold && !this.spawnedAtThresholds.has(threshold)) {
        this.spawnedAtThresholds.add(threshold);
        return this.spawnFruit();
      }
    }

    return null;
  }

  /**
   * Check if fruit has spawned at a specific threshold.
   *
   * @param threshold The dot-count threshold
   * @returns True if fruit has spawned at this threshold
   */
  hasSpawnedAt(threshold: number): boolean {
    return this.spawnedAtThresholds.has(threshold);
  }

  /**
   * Get the currently spawned fruit, if any.
   *
   * @returns The current fruit or null if none spawned
   */
  getCurrentFruit(): SpawnedFruit | null {
    return this.currentFruit;
  }

  /**
   * Check if the current fruit has expired (despawn timeout exceeded).
   *
   * @returns True if fruit exists and has expired
   */
  isFruitExpired(): boolean {
    if (!this.currentFruit) {
      return false;
    }
    const elapsedMs = Date.now() - this.currentFruit.spawnedAt;
    return elapsedMs >= this.currentFruit.despawnTimeoutMs;
  }

  /**
   * Remove the current fruit (either due to collection or despawn).
   * Returns the fruit's point value if it was collected, 0 if it expired.
   *
   * @param wasCollected Whether the fruit was collected by Pac-Man
   * @returns Points awarded (fruit points if collected, 0 if expired)
   */
  removeFruit(wasCollected: boolean): number {
    if (!this.currentFruit) {
      return 0;
    }
    const points = wasCollected ? this.currentFruit.points : 0;
    this.currentFruit = null;
    return points;
  }

  /**
   * Reset the fruit manager for a new level.
   *
   * @param newLevel The new level number
   */
  resetForNewLevel(newLevel: number): void {
    this.level = newLevel;
    this.currentFruit = null;
    this.totalDotsEaten = 0;
    this.spawnedAtThresholds.clear();
  }

  /**
   * Spawn a fruit at a random location in the maze.
   * In a real implementation, this would place the fruit near the ghost house.
   * For now, we use a fixed position.
   *
   * @returns The newly spawned fruit
   */
  private spawnFruit(): SpawnedFruit {
    const fruitConfig = getFruitConfigForLevel(this.level);
    const levelConfig = getLevelConfig(this.level);

    this.currentFruit = {
      type: fruitConfig.type,
      row: 14, // Fixed position near ghost house (center of maze)
      col: 13,
      points: fruitConfig.points,
      spawnedAt: Date.now(),
      despawnTimeoutMs: levelConfig.fruitDespawnTimeoutMs || 9000,
    };

    return this.currentFruit;
  }
}

// Re-export fruit config for external use
export { FRUIT_CONFIG_TABLE, getFruitConfigForLevel };

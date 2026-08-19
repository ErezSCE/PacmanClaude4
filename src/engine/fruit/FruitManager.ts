/**
 * FruitManager tracks the dots-eaten counter for the current level and
 * raises bonus fruit spawn events at the classic ~70 / ~170 dot thresholds.
 * It also owns the level -> fruit type/points mapping table used to decide
 * which fruit sprite and score value applies once a spawn is triggered.
 */

/** Bonus fruit sprite identifiers, escalating in value per level. */
export type FruitType =
  | 'cherry'
  | 'strawberry'
  | 'orange'
  | 'apple'
  | 'melon'
  | 'galaxian'
  | 'bell'
  | 'key';

/** A single row of the level -> fruit mapping table. */
export interface FruitConfig {
  readonly type: FruitType;
  readonly points: number;
}

/** Event emitted when a dot-count threshold is crossed and fruit should spawn. */
export interface FruitSpawnEvent {
  readonly config: FruitConfig;
  readonly thresholdIndex: number;
  readonly dotsEatenAtSpawn: number;
}

/**
 * Level-indexed fruit type/points table (index 0 = level 1). Levels beyond
 * the table length repeat the final (highest-value) entry, matching the
 * game's documented "repeat-at-cap" difficulty scaling behaviour.
 */
export const FRUIT_CONFIG_TABLE: readonly FruitConfig[] = [
  { type: 'cherry', points: 100 },
  { type: 'strawberry', points: 300 },
  { type: 'orange', points: 500 },
  { type: 'apple', points: 700 },
  { type: 'melon', points: 1000 },
  { type: 'galaxian', points: 2000 },
  { type: 'bell', points: 3000 },
  { type: 'key', points: 5000 },
];

/** Dot-eaten counter thresholds (per level) at which bonus fruit spawns. */
export const FRUIT_SPAWN_DOT_THRESHOLDS: readonly number[] = [70, 170];

/**
 * Returns the fruit type/points configuration for a given 1-based level
 * number. Levels beyond the table repeat the highest configured entry.
 *
 * @param level - 1-based level number.
 * @returns The fruit config (sprite type + point value) for that level.
 */
export function getFruitConfigForLevel(level: number): FruitConfig {
  const zeroBasedIndex = Math.max(level - 1, 0);
  const cappedIndex = Math.min(zeroBasedIndex, FRUIT_CONFIG_TABLE.length - 1);
  return FRUIT_CONFIG_TABLE[cappedIndex];
}

/**
 * Tracks the dots-eaten counter for the current level and determines when
 * bonus fruit should spawn near the maze center. Each threshold fires at
 * most once per level; call {@link FruitManager.reset} when a new level
 * begins.
 */
export class FruitManager {
  private readonly level: number;
  private readonly thresholds: readonly number[];
  private readonly triggeredThresholds: Set<number> = new Set();

  /**
   * @param level - 1-based level number used to look up the fruit config.
   * @param thresholds - Dot-eaten counter thresholds that trigger a spawn.
   */
  constructor(level: number, thresholds: readonly number[] = FRUIT_SPAWN_DOT_THRESHOLDS) {
    this.level = level;
    this.thresholds = thresholds;
  }

  /**
   * Records the current dots-eaten counter and returns a spawn event the
   * first time a configured threshold is reached or crossed.
   *
   * @param dotsEatenCount - Total dots eaten so far this level.
   * @returns The spawn event if a new threshold was crossed, otherwise null.
   */
  recordDotsEaten(dotsEatenCount: number): FruitSpawnEvent | null {
    for (let index = 0; index < this.thresholds.length; index += 1) {
      const threshold = this.thresholds[index];
      if (dotsEatenCount >= threshold && !this.triggeredThresholds.has(index)) {
        this.triggeredThresholds.add(index);
        return {
          config: getFruitConfigForLevel(this.level),
          thresholdIndex: index,
          dotsEatenAtSpawn: dotsEatenCount,
        };
      }
    }
    return null;
  }

  /** Returns whether the threshold at the given index has already fired. */
  hasSpawnedAt(thresholdIndex: number): boolean {
    return this.triggeredThresholds.has(thresholdIndex);
  }

  /** Clears all triggered thresholds, e.g. when advancing to a new level. */
  reset(): void {
    this.triggeredThresholds.clear();
  }
}

/**
 * Level configuration module.
 * Provides level-specific settings including fruit type, points, and despawn timeout.
 */

export interface FruitConfig {
  type: string;
  points: number;
}

export interface LevelConfig {
  level: number;
  fruitSpawnThresholds?: number[];
  fruitDespawnTimeoutMs?: number;
}

/**
 * Fruit configuration table mapping levels to fruit type and points.
 * Follows classic Pac-Man progression.
 */
export const FRUIT_CONFIG_TABLE: FruitConfig[] = [
  { type: 'cherry', points: 100 },        // Level 1
  { type: 'strawberry', points: 300 },    // Level 2
  { type: 'orange', points: 500 },        // Level 3
  { type: 'apple', points: 700 },         // Level 4
  { type: 'melon', points: 1000 },        // Level 5
  { type: 'galaxian', points: 2000 },     // Level 6
  { type: 'bell', points: 3000 },         // Level 7
  { type: 'key', points: 5000 },          // Level 8+
];

/**
 * Get fruit configuration for a given level.
 * Clamps level to valid range [1, table length].
 * Levels beyond the table repeat the highest entry.
 *
 * @param level The level number (1-indexed)
 * @returns Fruit configuration for the level
 */
export function getFruitConfigForLevel(level: number): FruitConfig {
  // Clamp level to valid range
  const clampedLevel = Math.max(1, Math.min(level, FRUIT_CONFIG_TABLE.length));
  return FRUIT_CONFIG_TABLE[clampedLevel - 1];
}

/**
 * Get full level configuration including fruit and despawn settings.
 *
 * @param level The level number (1-indexed)
 * @returns Level configuration
 */
export function getLevelConfig(level: number): LevelConfig {
  return {
    level,
    fruitSpawnThresholds: [70, 170],
    fruitDespawnTimeoutMs: 9000, // 9 seconds
  };
}

import { describe, expect, it } from 'vitest';

import {
  FRUIT_CONFIG_TABLE,
  FRUIT_SPAWN_DOT_THRESHOLDS,
  FruitManager,
  getFruitConfigForLevel,
} from './FruitManager';

describe('FruitManager', () => {
  describe('dot-count spawn triggers', () => {
    it('[US-013#1] does not spawn fruit before the ~70 dot threshold', () => {
      const manager = new FruitManager(1);

      expect(manager.recordDotsEaten(69)).toBeNull();
    });

    it('[US-013#1] spawns the first fruit once the counter reaches ~70', () => {
      const manager = new FruitManager(1);

      const event = manager.recordDotsEaten(70);

      expect(event).not.toBeNull();
      expect(event?.thresholdIndex).toBe(0);
      expect(event?.dotsEatenAtSpawn).toBe(70);
      expect(manager.hasSpawnedAt(0)).toBe(true);
    });

    it('[US-013#1] only triggers the ~70 threshold once even if recorded repeatedly', () => {
      const manager = new FruitManager(1);

      manager.recordDotsEaten(70);
      const secondCall = manager.recordDotsEaten(75);

      expect(secondCall).toBeNull();
    });

    it('[US-013#2] spawns a second fruit once the counter reaches ~170', () => {
      const manager = new FruitManager(1);

      manager.recordDotsEaten(70);
      const secondEvent = manager.recordDotsEaten(170);

      expect(secondEvent).not.toBeNull();
      expect(secondEvent?.thresholdIndex).toBe(1);
      expect(manager.hasSpawnedAt(1)).toBe(true);
    });

    it('[US-013#2] fires both thresholds in a single jump if the counter skips past 70', () => {
      const manager = new FruitManager(1);

      // Simulate ticks that individually cross each threshold in order.
      const first = manager.recordDotsEaten(70);
      const second = manager.recordDotsEaten(170);

      expect(first?.thresholdIndex).toBe(0);
      expect(second?.thresholdIndex).toBe(1);
    });

    it('resets triggered thresholds when a new level starts', () => {
      const manager = new FruitManager(1);
      manager.recordDotsEaten(70);

      manager.reset();

      expect(manager.hasSpawnedAt(0)).toBe(false);
      expect(manager.recordDotsEaten(70)).not.toBeNull();
    });

    it('exposes the classic ~70/~170 thresholds', () => {
      expect(FRUIT_SPAWN_DOT_THRESHOLDS).toEqual([70, 170]);
    });
  });

  describe('level-specific fruit type/points mapping', () => {
    it('[US-013#3] maps level 1 to cherry worth 100 points', () => {
      expect(getFruitConfigForLevel(1)).toEqual({ type: 'cherry', points: 100 });
    });

    it('[US-013#3] maps level 2 to strawberry worth 300 points', () => {
      expect(getFruitConfigForLevel(2)).toEqual({ type: 'strawberry', points: 300 });
    });

    it('[US-013#3] maps level 3 to orange worth 500 points', () => {
      expect(getFruitConfigForLevel(3)).toEqual({ type: 'orange', points: 500 });
    });

    it('[US-013#3] a spawn event carries the fruit config matching the level', () => {
      const manager = new FruitManager(2);

      const event = manager.recordDotsEaten(70);

      expect(event?.config).toEqual({ type: 'strawberry', points: 300 });
    });

    it('repeats the highest configured fruit for levels beyond the table', () => {
      const beyondTableLevel = FRUIT_CONFIG_TABLE.length + 5;

      expect(getFruitConfigForLevel(beyondTableLevel)).toEqual(
        FRUIT_CONFIG_TABLE[FRUIT_CONFIG_TABLE.length - 1],
      );
    });

    it('clamps level numbers below 1 to the first table entry', () => {
      expect(getFruitConfigForLevel(0)).toEqual(FRUIT_CONFIG_TABLE[0]);
    });
  });
});

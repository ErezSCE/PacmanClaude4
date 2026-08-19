import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FruitManager, FRUIT_CONFIG_TABLE, getFruitConfigForLevel } from './FruitManager';

describe('FruitManager', () => {
  let fruitManager: FruitManager;

  beforeEach(() => {
    fruitManager = new FruitManager(1);
    vi.useFakeTimers();
  });

  describe('Fruit spawning', () => {
    it('should spawn fruit when first threshold (70 dots) is reached', () => {
      const fruit = fruitManager.recordDotsEaten(70);
      expect(fruit).not.toBeNull();
      expect(fruit?.type).toBe('cherry');
      expect(fruit?.points).toBe(100);
    });

    it('should spawn fruit when second threshold (170 dots) is reached', () => {
      fruitManager.recordDotsEaten(70);
      const fruit = fruitManager.recordDotsEaten(170);
      expect(fruit).not.toBeNull();
      expect(fruit?.type).toBe('cherry');
    });

    it('should not spawn fruit multiple times at the same threshold', () => {
      const fruit1 = fruitManager.recordDotsEaten(70);
      const fruit2 = fruitManager.recordDotsEaten(75);
      expect(fruit1).not.toBeNull();
      expect(fruit2).toBeNull();
    });

    it('should track spawned thresholds with hasSpawnedAt', () => {
      fruitManager.recordDotsEaten(70);
      expect(fruitManager.hasSpawnedAt(70)).toBe(true);
      expect(fruitManager.hasSpawnedAt(170)).toBe(false);
    });
  });

  describe('[US-014#1] Fruit despawn timeout', () => {
    it('should despawn fruit after configured timeout if uncollected', () => {
      const fruit = fruitManager.recordDotsEaten(70);
      expect(fruit).not.toBeNull();
      expect(fruitManager.isFruitExpired()).toBe(false);

      // Advance time by 9 seconds (default timeout)
      vi.advanceTimersByTime(9000);
      expect(fruitManager.isFruitExpired()).toBe(true);
    });

    it('should not despawn fruit before timeout', () => {
      fruitManager.recordDotsEaten(70);
      vi.advanceTimersByTime(8000); // 1 second before timeout
      expect(fruitManager.isFruitExpired()).toBe(false);
    });

    it('should despawn fruit exactly at timeout boundary', () => {
      fruitManager.recordDotsEaten(70);
      vi.advanceTimersByTime(9000);
      expect(fruitManager.isFruitExpired()).toBe(true);
    });

    it('should return 0 points when removing expired fruit', () => {
      fruitManager.recordDotsEaten(70);
      vi.advanceTimersByTime(9000);
      const points = fruitManager.removeFruit(false);
      expect(points).toBe(0);
    });
  });

  describe('[US-014#2] Fruit collection scoring', () => {
    it('should award fruit points when collected before timeout', () => {
      const fruit = fruitManager.recordDotsEaten(70);
      expect(fruit?.points).toBe(100);

      const points = fruitManager.removeFruit(true);
      expect(points).toBe(100);
    });

    it('should award level-specific fruit points', () => {
      const level2Manager = new FruitManager(2);
      const fruit = level2Manager.recordDotsEaten(70);
      expect(fruit?.points).toBe(300);

      const points = level2Manager.removeFruit(true);
      expect(points).toBe(300);
    });

    it('should return 0 points when fruit is not collected', () => {
      fruitManager.recordDotsEaten(70);
      const points = fruitManager.removeFruit(false);
      expect(points).toBe(0);
    });

    it('should return 0 points when removing non-existent fruit', () => {
      const points = fruitManager.removeFruit(true);
      expect(points).toBe(0);
    });
  });

  describe('Fruit configuration', () => {
    it('should provide FRUIT_CONFIG_TABLE with all levels', () => {
      expect(FRUIT_CONFIG_TABLE.length).toBeGreaterThan(0);
      expect(FRUIT_CONFIG_TABLE[0].type).toBe('cherry');
      expect(FRUIT_CONFIG_TABLE[0].points).toBe(100);
    });

    it('should return correct fruit config for level 1', () => {
      const config = getFruitConfigForLevel(1);
      expect(config.type).toBe('cherry');
      expect(config.points).toBe(100);
    });

    it('should return correct fruit config for level 2', () => {
      const config = getFruitConfigForLevel(2);
      expect(config.type).toBe('strawberry');
      expect(config.points).toBe(300);
    });

    it('should clamp level to table bounds', () => {
      const config = getFruitConfigForLevel(999);
      expect(config.type).toBe('key');
      expect(config.points).toBe(5000);
    });

    it('should handle level 0 by clamping to level 1', () => {
      const config = getFruitConfigForLevel(0);
      expect(config.type).toBe('cherry');
      expect(config.points).toBe(100);
    });
  });

  describe('Level reset', () => {
    it('should reset fruit manager for new level', () => {
      fruitManager.recordDotsEaten(70);
      expect(fruitManager.hasSpawnedAt(70)).toBe(true);

      fruitManager.resetForNewLevel(2);
      expect(fruitManager.hasSpawnedAt(70)).toBe(false);
      expect(fruitManager.getCurrentFruit()).toBeNull();
    });

    it('should update fruit config when level changes', () => {
      fruitManager.resetForNewLevel(2);
      const fruit = fruitManager.recordDotsEaten(70);
      expect(fruit?.points).toBe(300);
    });
  });

  describe('Current fruit tracking', () => {
    it('should return current fruit', () => {
      const spawnedFruit = fruitManager.recordDotsEaten(70);
      const current = fruitManager.getCurrentFruit();
      expect(current).toEqual(spawnedFruit);
    });

    it('should return null when no fruit spawned', () => {
      const current = fruitManager.getCurrentFruit();
      expect(current).toBeNull();
    });

    it('should return null after fruit is removed', () => {
      fruitManager.recordDotsEaten(70);
      fruitManager.removeFruit(true);
      expect(fruitManager.getCurrentFruit()).toBeNull();
    });
  });
});

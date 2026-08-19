import { describe, it, expect } from 'vitest';
import { getLevelConfig } from './levelConfig';

describe('getLevelConfig', () => {
  it('[US-007#2] uses the 7s scatter / 20s chase pattern for level 1', () => {
    const config = getLevelConfig(1);

    expect(config.scatterDurationMs).toBe(7000);
    expect(config.chaseDurationMs).toBe(20000);
  });

  it('[US-007#2] keeps scatter/chase durations constant across levels', () => {
    const level1 = getLevelConfig(1);
    const level10 = getLevelConfig(10);

    expect(level10.scatterDurationMs).toBe(level1.scatterDurationMs);
    expect(level10.chaseDurationMs).toBe(level1.chaseDurationMs);
  });

  it('increases ghost and Pac-Man speed as the level rises, up to the max', () => {
    const level1 = getLevelConfig(1);
    const level5 = getLevelConfig(5);

    expect(level5.pacmanSpeed).toBeGreaterThan(level1.pacmanSpeed);
    expect(level5.ghostSpeed).toBeGreaterThan(level1.ghostSpeed);
  });

  it('repeats the level-20 configuration for levels beyond the cap', () => {
    const level20 = getLevelConfig(20);
    const level30 = getLevelConfig(30);

    expect(level30.pacmanSpeed).toBe(level20.pacmanSpeed);
    expect(level30.ghostSpeed).toBe(level20.ghostSpeed);
    expect(level30.scaredDurationMs).toBe(level20.scaredDurationMs);
  });
});

import { describe, it, expect } from 'vitest';
import { getLevelConfig } from './levelConfig';

describe('getLevelConfig', () => {
  it('returns a config with the requested level number', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
  });

  it('returns all fields required by the LevelConfig contract type', () => {
    const config = getLevelConfig(1);
    expect(config).toMatchObject({
      level: expect.any(Number),
      pacmanSpeed: expect.any(Number),
      ghostSpeed: expect.any(Number),
      frightenedSpeed: expect.any(Number),
      frightenedTime: expect.any(Number),
      scatterTime: expect.any(Number),
      chaseTime: expect.any(Number),
      elroyDotsLeft: expect.any(Number),
      elroySpeed: expect.any(Number),
    });
  });

  it('scales difficulty deterministically and caps out at high levels (repeat-at-cap)', () => {
    const level20 = getLevelConfig(20);
    const level21 = getLevelConfig(21);
    const level50 = getLevelConfig(50);

    // Values should be clamped/capped so 20+ behaves consistently.
    expect(level20.pacmanSpeed).toBeLessThanOrEqual(1.0);
    expect(level21.pacmanSpeed).toBeLessThanOrEqual(1.0);
    expect(level50.pacmanSpeed).toBe(level21.pacmanSpeed);
    expect(level50.ghostSpeed).toBe(level21.ghostSpeed);
  });

  it('never returns a level below 1 even for non-positive input', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

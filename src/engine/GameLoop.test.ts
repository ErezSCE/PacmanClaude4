import { describe, it, expect } from 'vitest';
import { GameLoop, createGameLoop } from './GameLoop';
import { Ghost } from './entities/Ghost';
import type { PacManState } from './ai/ghostAI';
import { getLevelConfig } from './levels/levelConfig';

function makeGhosts(): Ghost[] {
  return [
    new Ghost('blinky', { x: 13, y: 11 }, { x: 25, y: 0 }),
    new Ghost('pinky', { x: 14, y: 11 }, { x: 2, y: 0 }),
    new Ghost('inky', { x: 13, y: 14 }, { x: 27, y: 31 }),
    new Ghost('clyde', { x: 14, y: 14 }, { x: 0, y: 31 }),
  ];
}

function makePacmanState(): PacManState {
  return { position: { x: 10, y: 10 }, direction: 'right' };
}

describe('GameLoop scatter/chase alternation', () => {
  it('[US-007#1] targets each ghost scatter corner during scatter mode', () => {
    const ghosts = makeGhosts();
    const loop = createGameLoop({ level: 1, ghosts, getPacManState: makePacmanState });

    expect(loop.getPhase()).toBe('scatter');
    for (const ghost of ghosts) {
      expect(loop.getTarget(ghost.name)).toEqual(ghost.scatterTarget);
    }
  });

  it('[US-007#2] flips from scatter to chase once the level scatter duration elapses', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs - 1);
    expect(loop.getPhase()).toBe('scatter');

    loop.tick(2);
    expect(loop.getPhase()).toBe('chase');
  });

  it('[US-007#2] flips back from chase to scatter once the chase duration elapses', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs, chaseDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs);
    expect(loop.getPhase()).toBe('chase');

    loop.tick(chaseDurationMs);
    expect(loop.getPhase()).toBe('scatter');
  });

  it('[US-007#2] uses the level-configured durations for a different level', () => {
    const ghosts = makeGhosts();
    const level = 5;
    const loop = new GameLoop({ level, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(level);

    loop.tick(scatterDurationMs - 1);
    expect(loop.getPhase()).toBe('scatter');

    loop.tick(1);
    expect(loop.getPhase()).toBe('chase');
  });

  it('[US-007#2] setLevel resets the phase timer and reapplies scatter mode', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs);
    expect(loop.getPhase()).toBe('chase');

    loop.setLevel(2);
    expect(loop.getPhase()).toBe('scatter');
    for (const ghost of ghosts) {
      expect(ghost.mode).toBe('scatter');
    }
  });

  it('[US-007#3] applies the mode transition to all four ghosts simultaneously', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs);

    for (const ghost of ghosts) {
      expect(ghost.mode).toBe('chase');
    }
  });

  it('[US-007#3] leaves scared/eaten ghosts untouched by the phase flip', () => {
    const ghosts = makeGhosts();
    const scaredGhost = ghosts[1];
    scaredGhost.setMode('scared');
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs);

    expect(scaredGhost.mode).toBe('scared');
    for (const ghost of ghosts) {
      if (ghost === scaredGhost) continue;
      expect(ghost.mode).toBe('chase');
    }
  });

  it('[US-007#1] targets Pac-Man via chooseTarget logic once in chase mode', () => {
    const ghosts = makeGhosts();
    const blinky = ghosts[0];
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs } = getLevelConfig(1);

    loop.tick(scatterDurationMs);

    expect(loop.getTarget(blinky.name)).toEqual(makePacmanState().position);
  });

  it('handles multiple phase boundaries crossed within a single large tick', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scatterDurationMs, chaseDurationMs } = getLevelConfig(1);

    // scatter -> chase -> scatter within one tick.
    loop.tick(scatterDurationMs + chaseDurationMs + 1);

    expect(loop.getPhase()).toBe('scatter');
  });
});

describe('GameLoop scared mode on power pellet consumption', () => {
  it('[US-009#1] reverses the direction of every active ghost immediately', () => {
    const ghosts = makeGhosts();
    for (const ghost of ghosts) {
      ghost.setDirection('left');
    }
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });

    loop.onPowerPelletEaten();

    for (const ghost of ghosts) {
      expect(ghost.direction).toBe('right');
    }
  });

  it('[US-009#2] switches all active ghosts to scared mode with reduced speed', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });

    loop.onPowerPelletEaten();

    for (const ghost of ghosts) {
      expect(ghost.mode).toBe('scared');
      expect(ghost.speed).toBeLessThan(1);
    }
  });

  it('[US-009#3] does not affect ghosts that are currently eaten (eyes returning home)', () => {
    const ghosts = makeGhosts();
    const eatenGhost = ghosts[2];
    eatenGhost.setMode('eaten');
    eatenGhost.setDirection('up');
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });

    loop.onPowerPelletEaten();

    expect(eatenGhost.mode).toBe('eaten');
    expect(eatenGhost.direction).toBe('up');
    for (const ghost of ghosts) {
      if (ghost === eatenGhost) continue;
      expect(ghost.mode).toBe('scared');
    }
  });

  it('[US-009#2] reverts to the current phase mode and restores speed once the scared duration elapses', () => {
    const ghosts = makeGhosts();
    const loop = new GameLoop({ level: 1, ghosts, getPacManState: makePacmanState });
    const { scaredDurationMs } = getLevelConfig(1);

    loop.onPowerPelletEaten();
    loop.tick(scaredDurationMs);

    for (const ghost of ghosts) {
      expect(ghost.mode).toBe(loop.getPhase());
      expect(ghost.speed).toBe(1);
    }
  });
});

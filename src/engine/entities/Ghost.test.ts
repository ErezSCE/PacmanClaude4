import { describe, it, expect } from 'vitest';
import { Ghost } from './Ghost';

describe('Ghost', () => {
  it('initializes with the given name, position, scatter target, and default mode', () => {
    const ghost = new Ghost('blinky', { x: 1, y: 2 }, { x: 25, y: 0 });

    expect(ghost.name).toBe('blinky');
    expect(ghost.position).toEqual({ x: 1, y: 2 });
    expect(ghost.scatterTarget).toEqual({ x: 25, y: 0 });
    expect(ghost.mode).toBe('scatter');
    expect(ghost.direction).toBe('none');
    expect(ghost.speed).toBe(1);
  });

  it('accepts a custom speed', () => {
    const ghost = new Ghost('pinky', { x: 0, y: 0 }, { x: 0, y: 0 }, 1.5);
    expect(ghost.speed).toBe(1.5);
  });

  it('setMode updates the current mode', () => {
    const ghost = new Ghost('inky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.setMode('chase');
    expect(ghost.mode).toBe('chase');
  });

  it('setDirection updates the current direction', () => {
    const ghost = new Ghost('clyde', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.setDirection('left');
    expect(ghost.direction).toBe('left');
  });

  it('moveTo updates the current position', () => {
    const ghost = new Ghost('blinky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.moveTo({ x: 5, y: 5 });
    expect(ghost.position).toEqual({ x: 5, y: 5 });
  });

  it('[US-009#1] reverseDirection flips travel to the opposite direction', () => {
    const ghost = new Ghost('blinky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.setDirection('left');
    ghost.reverseDirection();
    expect(ghost.direction).toBe('right');
  });

  it('[US-009#1] reverseDirection leaves a stationary ghost stationary', () => {
    const ghost = new Ghost('blinky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.reverseDirection();
    expect(ghost.direction).toBe('none');
  });

  it('[US-009#1] enterScaredMode reverses the ghost direction immediately', () => {
    const ghost = new Ghost('pinky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.setDirection('up');
    ghost.enterScaredMode(0.5);
    expect(ghost.direction).toBe('down');
  });

  it('[US-009#2] enterScaredMode reduces speed by the given multiplier', () => {
    const ghost = new Ghost('inky', { x: 0, y: 0 }, { x: 0, y: 0 }, 2);
    ghost.enterScaredMode(0.5);
    expect(ghost.speed).toBe(1);
  });

  it('[US-009#2] restoreBaseSpeed restores the original speed after scared mode ends', () => {
    const ghost = new Ghost('clyde', { x: 0, y: 0 }, { x: 0, y: 0 }, 1.2);
    ghost.enterScaredMode(0.5);
    ghost.restoreBaseSpeed();
    expect(ghost.speed).toBe(1.2);
  });

  it('[US-009#3] enterScaredMode switches the ghost mode to scared', () => {
    const ghost = new Ghost('blinky', { x: 0, y: 0 }, { x: 0, y: 0 });
    ghost.setMode('chase');
    ghost.enterScaredMode(0.5);
    expect(ghost.mode).toBe('scared');
  });
});

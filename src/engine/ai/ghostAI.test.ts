import { describe, it, expect } from 'vitest';
import { Ghost } from '../entities/Ghost';
import { chooseTarget, getScatterTarget, type PacManState } from './ghostAI';

function makePacman(position: PacManState['position'], direction: PacManState['direction']): PacManState {
  return { position, direction };
}

describe('ghostAI', () => {
  describe('[US-006#1] Blinky chooseTarget', () => {
    it('returns Pac-Man current tile during chase mode', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      blinky.setMode('chase');
      const pacman = makePacman({ x: 10, y: 12 }, 'right');

      const target = chooseTarget(blinky, pacman, blinky);

      expect(target).toEqual({ x: 10, y: 12 });
    });

    it('returns the scatter corner while in scatter mode', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      const pacman = makePacman({ x: 10, y: 12 }, 'right');

      const target = chooseTarget(blinky, pacman, blinky);

      expect(target).toEqual(getScatterTarget(blinky));
    });
  });

  describe('[US-006#2] Pinky chooseTarget', () => {
    it('returns a tile several tiles ahead of Pac-Man current direction', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      const pinky = new Ghost('pinky', { x: 5, y: 5 }, { x: 2, y: 0 });
      pinky.setMode('chase');
      const pacman = makePacman({ x: 10, y: 10 }, 'up');

      const target = chooseTarget(pinky, pacman, blinky);

      expect(target).toEqual({ x: 10, y: 6 });
    });

    it('ambushes to the right when Pac-Man faces right', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      const pinky = new Ghost('pinky', { x: 5, y: 5 }, { x: 2, y: 0 });
      pinky.setMode('chase');
      const pacman = makePacman({ x: 10, y: 10 }, 'right');

      const target = chooseTarget(pinky, pacman, blinky);

      expect(target).toEqual({ x: 14, y: 10 });
    });
  });

  describe('[US-006#3] Inky chooseTarget', () => {
    it('computes a flanking tile relative to Blinky position and Pac-Man', () => {
      const blinky = new Ghost('blinky', { x: 2, y: 2 }, { x: 25, y: 0 });
      const inky = new Ghost('inky', { x: 8, y: 8 }, { x: 25, y: 31 });
      inky.setMode('chase');
      const pacman = makePacman({ x: 10, y: 10 }, 'up');

      // Pivot = pacman + 2 tiles up = (10, 8).
      // Target = pivot + (pivot - blinky) = (10 + (10-2), 8 + (8-2)) = (18, 14).
      const target = chooseTarget(inky, pacman, blinky);

      expect(target).toEqual({ x: 18, y: 14 });
    });

    it('changes when Blinky position changes for the same Pac-Man state', () => {
      const inky = new Ghost('inky', { x: 8, y: 8 }, { x: 25, y: 31 });
      inky.setMode('chase');
      const pacman = makePacman({ x: 10, y: 10 }, 'left');

      const blinkyNear = new Ghost('blinky', { x: 9, y: 10 }, { x: 25, y: 0 });
      const blinkyFar = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });

      const targetNear = chooseTarget(inky, pacman, blinkyNear);
      const targetFar = chooseTarget(inky, pacman, blinkyFar);

      expect(targetNear).not.toEqual(targetFar);
    });
  });

  describe('[US-006#4] Clyde chooseTarget', () => {
    it('chases directly when far from Pac-Man', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      const clyde = new Ghost('clyde', { x: 0, y: 0 }, { x: 0, y: 31 });
      clyde.setMode('chase');
      const pacman = makePacman({ x: 20, y: 20 }, 'down');

      const target = chooseTarget(clyde, pacman, blinky);

      expect(target).toEqual({ x: 20, y: 20 });
    });

    it('retreats to its scatter-like target when close to Pac-Man', () => {
      const blinky = new Ghost('blinky', { x: 0, y: 0 }, { x: 25, y: 0 });
      const clyde = new Ghost('clyde', { x: 10, y: 10 }, { x: 0, y: 31 });
      clyde.setMode('chase');
      const pacman = makePacman({ x: 11, y: 10 }, 'down');

      const target = chooseTarget(clyde, pacman, blinky);

      expect(target).toEqual(getScatterTarget(clyde));
    });
  });
});

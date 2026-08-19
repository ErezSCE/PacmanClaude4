import { describe, it, expect, beforeEach } from 'vitest';
import { PacMan } from './PacMan';

/**
 * Test suite for PacMan movement and wall-stop rules.
 * Tests cover:
 * - Continuous movement in current direction until blocked by wall
 * - Queued direction changes applied when physically possible
 * - Chomp animation cycling while moving, freezing when stationary
 * - Exact stopping at wall boundaries without clipping
 */
describe('PacMan', () => {
  let pacman: PacMan;

  beforeEach(() => {
    pacman = new PacMan(5, 5);
  });

  describe('[US-002#1] continuous movement in current direction until blocked by wall', () => {
    it('[US-002#1] should move right continuously when no walls block the path', () => {
      const isWall = () => false; // No walls

      const startX = pacman.x;
      pacman.update(isWall);
      expect(pacman.x).toBe(startX + 1);
      expect(pacman.y).toBe(5);

      pacman.update(isWall);
      expect(pacman.x).toBe(startX + 2);
      expect(pacman.y).toBe(5);

      pacman.update(isWall);
      expect(pacman.x).toBe(startX + 3);
      expect(pacman.y).toBe(5);
    });

    it('[US-002#1] should move left continuously when no walls block the path', () => {
      pacman.currentDirection = 'left';
      const isWall = () => false;

      const startX = pacman.x;
      pacman.update(isWall);
      expect(pacman.x).toBe(startX - 1);

      pacman.update(isWall);
      expect(pacman.x).toBe(startX - 2);

      pacman.update(isWall);
      expect(pacman.x).toBe(startX - 3);
    });

    it('[US-002#1] should move up continuously when no walls block the path', () => {
      pacman.currentDirection = 'up';
      const isWall = () => false;

      const startY = pacman.y;
      pacman.update(isWall);
      expect(pacman.y).toBe(startY - 1);

      pacman.update(isWall);
      expect(pacman.y).toBe(startY - 2);

      pacman.update(isWall);
      expect(pacman.y).toBe(startY - 3);
    });

    it('[US-002#1] should move down continuously when no walls block the path', () => {
      pacman.currentDirection = 'down';
      const isWall = () => false;

      const startY = pacman.y;
      pacman.update(isWall);
      expect(pacman.y).toBe(startY + 1);

      pacman.update(isWall);
      expect(pacman.y).toBe(startY + 2);

      pacman.update(isWall);
      expect(pacman.y).toBe(startY + 3);
    });

    it('[US-002#1] should stop moving when hitting a wall in the current direction', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 7; // Wall at x=7

      const startX = pacman.x;
      pacman.update(isWall); // Move to 6
      expect(pacman.x).toBe(startX + 1);

      pacman.update(isWall); // Try to move to 7 (wall), should stay at 6
      expect(pacman.x).toBe(startX + 1);

      pacman.update(isWall); // Still blocked
      expect(pacman.x).toBe(startX + 1);
    });

    it('[US-002#1] should maintain current direction when blocked by wall', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 6; // Wall immediately ahead

      pacman.update(isWall);
      expect(pacman.x).toBe(5); // No movement
      expect(pacman.currentDirection).toBe('right'); // Direction unchanged
    });

    it('[US-002#1] should not move when direction is "none"', () => {
      pacman.currentDirection = 'none';
      const isWall = () => false;

      const startX = pacman.x;
      const startY = pacman.y;
      pacman.update(isWall);
      expect(pacman.x).toBe(startX);
      expect(pacman.y).toBe(startY);
    });
  });

  describe('[US-002#2] queued direction changes applied when physically possible', () => {
    it('[US-002#2] should apply queued direction on next update if path is clear', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      // Queue a left turn
      pacman.setQueuedDirection('left');
      expect(pacman.queuedDirection).toBe('left');

      // Next update should apply the queued direction
      pacman.update(isWall);
      expect(pacman.currentDirection).toBe('left');
      expect(pacman.queuedDirection).toBeNull();
      expect(pacman.x).toBe(4); // Moved left
    });

    it('[US-002#2] should apply queued direction to move up when path is clear', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      pacman.setQueuedDirection('up');
      pacman.update(isWall);
      expect(pacman.currentDirection).toBe('up');
      expect(pacman.y).toBe(4); // Moved up
    });

    it('[US-002#2] should apply queued direction to move down when path is clear', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      pacman.setQueuedDirection('down');
      pacman.update(isWall);
      expect(pacman.currentDirection).toBe('down');
      expect(pacman.y).toBe(6); // Moved down
    });

    it('[US-002#2] should not apply queued direction if blocked by wall', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 4; // Wall to the left

      pacman.setQueuedDirection('left');
      pacman.update(isWall);

      // Should continue right instead
      expect(pacman.currentDirection).toBe('right');
      expect(pacman.queuedDirection).toBe('left'); // Still queued
      expect(pacman.x).toBe(6); // Moved right
    });

    it('[US-002#2] should keep queued direction until it becomes valid', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 4; // Wall to the left

      pacman.setQueuedDirection('left');
      pacman.update(isWall);
      expect(pacman.queuedDirection).toBe('left');

      pacman.update(isWall);
      expect(pacman.queuedDirection).toBe('left');

      // Now clear the wall and update again
      const isWallCleared = () => false;
      pacman.update(isWallCleared);
      expect(pacman.currentDirection).toBe('left');
      expect(pacman.queuedDirection).toBeNull();
    });

    it('[US-002#2] should prioritize queued direction over current direction', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      pacman.setQueuedDirection('up');
      pacman.update(isWall);

      // Should have moved up, not right
      expect(pacman.y).toBe(4);
      expect(pacman.x).toBe(5); // x unchanged
    });

    it('[US-002#2] should clear queued direction after successful application', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      pacman.setQueuedDirection('left');
      pacman.update(isWall);
      expect(pacman.queuedDirection).toBeNull();

      // Queue another direction
      pacman.setQueuedDirection('up');
      expect(pacman.queuedDirection).toBe('up');
    });

    it('[US-002#2] should not apply queued "none" direction', () => {
      pacman.currentDirection = 'right';
      const isWall = () => false;

      pacman.setQueuedDirection('none');
      pacman.update(isWall);

      // Should continue right
      expect(pacman.currentDirection).toBe('right');
      expect(pacman.x).toBe(6);
    });
  });

  describe('[US-002#3] chomp animation cycles while moving, freezes when stationary', () => {
    it('[US-002#3] should start with chomp frame 0', () => {
      expect(pacman.chompFrame).toBe(0);
    });

    it('[US-002#3] should cycle chomp animation while moving', () => {
      const isWall = () => false;

      // Frame 0 initially
      expect(pacman.chompFrame).toBe(0);

      // Move several times to trigger animation
      for (let i = 0; i < 4; i++) {
        pacman.update(isWall);
      }
      expect(pacman.chompFrame).toBe(1); // Should toggle after CHOMP_INTERVAL (4) ticks

      for (let i = 0; i < 4; i++) {
        pacman.update(isWall);
      }
      expect(pacman.chompFrame).toBe(0); // Should toggle back
    });

    it('[US-002#3] should freeze chomp animation at frame 0 when stationary', () => {
      const isWall = (x: number) => x === 6; // Wall immediately ahead

      pacman.currentDirection = 'right';
      pacman.update(isWall); // Try to move but blocked
      expect(pacman.chompFrame).toBe(0); // Frozen at 0
    });

    it('[US-002#3] should freeze animation when direction is "none"', () => {
      pacman.currentDirection = 'none';
      const isWall = () => false;

      pacman.update(isWall);
      expect(pacman.chompFrame).toBe(0);
    });

    it('[US-002#3] should resume animation when movement resumes', () => {
      const isWallAhead = (x: number) => x === 6;
      const isWallCleared = () => false;

      pacman.currentDirection = 'right';

      // Hit wall and freeze
      pacman.update(isWallAhead);
      expect(pacman.chompFrame).toBe(0);

      // Clear wall and move again
      for (let i = 0; i < 4; i++) {
        pacman.update(isWallCleared);
      }
      expect(pacman.chompFrame).toBe(1); // Animation resumes
    });

    it('[US-002#3] should only toggle between frames 0 and 1', () => {
      const isWall = () => false;

      // Move many times and verify frame stays 0 or 1
      for (let i = 0; i < 100; i++) {
        pacman.update(isWall);
        expect([0, 1]).toContain(pacman.chompFrame);
      }
    });
  });

  describe('[US-002#4] stops exactly at wall boundary without clipping', () => {
    it('[US-002#4] should stop exactly one tile before a wall when moving right', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 8; // Wall at x=8

      const startX = pacman.x;
      pacman.update(isWall); // Move to 6
      expect(pacman.x).toBe(startX + 1);

      pacman.update(isWall); // Move to 7
      expect(pacman.x).toBe(startX + 2);

      pacman.update(isWall); // Try to move to 8 (wall), stay at 7
      expect(pacman.x).toBe(startX + 2);
    });

    it('[US-002#4] should stop exactly one tile before a wall when moving left', () => {
      pacman.x = 10;
      pacman.currentDirection = 'left';
      const isWall = (x: number) => x === 7; // Wall at x=7

      pacman.update(isWall); // Move to 9
      expect(pacman.x).toBe(9);

      pacman.update(isWall); // Move to 8
      expect(pacman.x).toBe(8);

      pacman.update(isWall); // Try to move to 7 (wall), stay at 8
      expect(pacman.x).toBe(8);
    });

    it('[US-002#4] should stop exactly one tile before a wall when moving up', () => {
      pacman.currentDirection = 'up';
      const isWall = (x: number, y: number) => {
        void x;
        return y === 2; // Wall at y=2
      };

      pacman.update(isWall); // Move to 4
      expect(pacman.y).toBe(4);

      pacman.update(isWall); // Move to 3
      expect(pacman.y).toBe(3);

      pacman.update(isWall); // Try to move to 2 (wall), stay at 3
      expect(pacman.y).toBe(3);
    });

    it('[US-002#4] should stop exactly one tile before a wall when moving down', () => {
      pacman.currentDirection = 'down';
      const isWall = (x: number, y: number) => {
        void x;
        return y === 8; // Wall at y=8
      };

      pacman.update(isWall); // Move to 6
      expect(pacman.y).toBe(6);

      pacman.update(isWall); // Move to 7
      expect(pacman.y).toBe(7);

      pacman.update(isWall); // Try to move to 8 (wall), stay at 7
      expect(pacman.y).toBe(7);
    });

    it('[US-002#4] should not clip into walls on diagonal boundaries', () => {
      pacman.x = 5;
      pacman.y = 5;
      pacman.currentDirection = 'right';
      const isWall = (x: number, y: number) => x === 8 && y === 5; // Wall only at (8, 5)

      pacman.update(isWall); // Move to 6
      expect(pacman.x).toBe(6);
      expect(pacman.y).toBe(5);

      pacman.update(isWall); // Move to 7
      expect(pacman.x).toBe(7);
      expect(pacman.y).toBe(5);

      pacman.update(isWall); // Try to move to 8 (wall), stay at 7
      expect(pacman.x).toBe(7);
      expect(pacman.y).toBe(5);
    });

    it('[US-002#4] should handle multiple walls correctly', () => {
      pacman.currentDirection = 'right';
      const isWall = (x: number) => x === 8 || x === 10; // Walls at x=8 and x=10

      pacman.update(isWall); // Move to 6
      expect(pacman.x).toBe(6);

      pacman.update(isWall); // Move to 7
      expect(pacman.x).toBe(7);

      pacman.update(isWall); // Try to move to 8 (wall), stay at 7
      expect(pacman.x).toBe(7);
    });
  });

  describe('Position and state management', () => {
    it('should return correct position as tuple', () => {
      const [x, y] = pacman.getPosition();
      expect(x).toBe(5);
      expect(y).toBe(5);
    });

    it('should reset to starting position and direction', () => {
      pacman.x = 10;
      pacman.y = 15;
      pacman.currentDirection = 'left';
      pacman.setQueuedDirection('up');

      pacman.reset(3, 4);

      expect(pacman.x).toBe(3);
      expect(pacman.y).toBe(4);
      expect(pacman.currentDirection).toBe('right');
      expect(pacman.queuedDirection).toBeNull();
      expect(pacman.chompFrame).toBe(0);
    });

    it('should initialize with correct starting position', () => {
      const newPacman = new PacMan(10, 20);
      expect(newPacman.x).toBe(10);
      expect(newPacman.y).toBe(20);
      expect(newPacman.currentDirection).toBe('right');
      expect(newPacman.queuedDirection).toBeNull();
    });
  });

  describe('Complex movement scenarios', () => {
    it('should handle rapid direction changes with walls', () => {
      const isWall = (x: number, y: number) => {
        // Create a simple maze: walls at x=8 and y=8
        return x === 8 || y === 8;
      };

      pacman.currentDirection = 'right';
      pacman.update(isWall); // Move right to 6
      expect(pacman.x).toBe(6);

      pacman.setQueuedDirection('down');
      pacman.update(isWall); // Apply down, move to (6, 6)
      expect(pacman.x).toBe(6);
      expect(pacman.y).toBe(6);

      pacman.setQueuedDirection('right');
      pacman.update(isWall); // Apply right, move to (7, 6)
      expect(pacman.x).toBe(7);
      expect(pacman.y).toBe(6);

      pacman.update(isWall); // Try right again, hit wall at x=8
      expect(pacman.x).toBe(7);
    });

    it('should handle corner navigation', () => {
      const isWall = (x: number, y: number) => {
        // L-shaped wall
        return (x === 8 && y >= 5) || (y === 8 && x >= 5);
      };

      pacman.x = 7;
      pacman.y = 7;
      pacman.currentDirection = 'right';

      // Try to move right into wall
      pacman.update(isWall);
      expect(pacman.x).toBe(7); // Blocked

      // Queue up direction
      pacman.setQueuedDirection('up');
      pacman.update(isWall);
      expect(pacman.y).toBe(6); // Should move up
      expect(pacman.currentDirection).toBe('up');
    });

    it('should maintain state through multiple blocked attempts', () => {
      // Wall immediately ahead in both the current ('right') and queued ('up') directions
      const isWall = (x: number, y: number) => x === 6 || y === 4;

      pacman.currentDirection = 'right';
      pacman.setQueuedDirection('up');

      // Multiple updates while blocked
      for (let i = 0; i < 5; i++) {
        pacman.update(isWall);
        expect(pacman.x).toBe(5); // Never moves
        expect(pacman.queuedDirection).toBe('up'); // Queued direction persists
      }
    });
  });
});

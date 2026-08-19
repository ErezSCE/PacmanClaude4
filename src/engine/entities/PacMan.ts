import { Direction } from '../../types/index';

/**
 * PacMan entity: encapsulates position, direction state, and chomp animation.
 * Movement is continuous in the current direction until blocked by a wall.
 * A queued direction change is applied as soon as it becomes physically possible.
 */
export class PacMan {
  /** Current tile position (x, y) */
  x: number;
  y: number;

  /** Current direction Pac-Man is moving */
  currentDirection: Direction = 'right';

  /** Queued direction change (applied when possible) */
  queuedDirection: Direction | null = null;

  /** Chomp animation frame (0 or 1) */
  chompFrame: number = 0;

  /** Chomp animation counter (increments each tick, resets at interval) */
  private chompCounter: number = 0;

  /** Chomp animation interval (ticks between frame changes) */
  private readonly CHOMP_INTERVAL: number = 4;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  /**
   * Queue a direction change. The direction will be applied on the next tick
   * if the move is valid (not blocked by a wall).
   */
  setQueuedDirection(direction: Direction): void {
    this.queuedDirection = direction;
  }

  /**
   * Update Pac-Man's position and animation state.
   * Attempts to move in the queued direction if set and valid;
   * otherwise continues in the current direction.
   * Updates chomp animation frame.
   *
   * @param isWall - Function to check if a tile is a wall
   * @returns true if Pac-Man moved, false if blocked
   */
  update(isWall: (x: number, y: number) => boolean): boolean {
    let moved = false;

    // Try queued direction first
    if (this.queuedDirection !== null && this.queuedDirection !== 'none') {
      const nextPos = this.getNextPosition(this.queuedDirection);
      if (!isWall(nextPos.x, nextPos.y)) {
        // Queued direction is valid, apply it
        this.currentDirection = this.queuedDirection;
        this.x = nextPos.x;
        this.y = nextPos.y;
        this.queuedDirection = null;
        moved = true;
      }
    }

    // If queued direction didn't move us, try current direction
    if (!moved && this.currentDirection !== 'none') {
      const nextPos = this.getNextPosition(this.currentDirection);
      if (!isWall(nextPos.x, nextPos.y)) {
        this.x = nextPos.x;
        this.y = nextPos.y;
        moved = true;
      }
    }

    // Update chomp animation
    this.updateChompAnimation(moved);

    return moved;
  }

  /**
   * Calculate the next position in a given direction.
   */
  private getNextPosition(direction: Direction): { x: number; y: number } {
    let nextX = this.x;
    let nextY = this.y;

    switch (direction) {
      case 'up':
        nextY -= 1;
        break;
      case 'down':
        nextY += 1;
        break;
      case 'left':
        nextX -= 1;
        break;
      case 'right':
        nextX += 1;
        break;
      case 'none':
        break;
    }

    return { x: nextX, y: nextY };
  }

  /**
   * Update the chomp animation frame.
   * Cycles between 0 and 1 while moving, freezes at 0 when stationary.
   */
  private updateChompAnimation(moved: boolean): void {
    if (!moved) {
      // Freeze animation when stationary
      this.chompFrame = 0;
      this.chompCounter = 0;
      return;
    }

    // Increment counter and toggle frame at interval
    this.chompCounter += 1;
    if (this.chompCounter >= this.CHOMP_INTERVAL) {
      this.chompFrame = this.chompFrame === 0 ? 1 : 0;
      this.chompCounter = 0;
    }
  }

  /**
   * Get the current position as a tuple.
   */
  getPosition(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Reset to a starting position and direction.
   */
  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.currentDirection = 'right';
    this.queuedDirection = null;
    this.chompFrame = 0;
    this.chompCounter = 0;
  }
}

/**
 * Ghost entity representing one of the four AI-controlled enemies.
 * Holds only state (position, direction, mode, speed); target-tile
 * selection and personality logic live in `engine/ai/ghostAI.ts`.
 */
import type { Direction, GhostMode } from '../../types';

/** Identifies which of the four ghosts an instance represents. */
export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

/** A tile coordinate on the maze grid. */
export interface GridPosition {
  x: number;
  y: number;
}

/** Maps each direction to its 180-degree opposite, used on scared reversal. */
const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
  none: 'none',
};

/**
 * One of the four AI-controlled ghosts (Blinky, Pinky, Inky, Clyde).
 */
export class Ghost {
  readonly name: GhostName;
  readonly scatterTarget: GridPosition;
  position: GridPosition;
  direction: Direction;
  mode: GhostMode;
  speed: number;
  private readonly baseSpeed: number;

  constructor(
    name: GhostName,
    startPosition: GridPosition,
    scatterTarget: GridPosition,
    speed = 1,
  ) {
    this.name = name;
    this.position = startPosition;
    this.scatterTarget = scatterTarget;
    this.direction = 'none';
    this.mode = 'scatter';
    this.speed = speed;
    this.baseSpeed = speed;
  }

  /** Updates the ghost's current behavior mode. */
  setMode(mode: GhostMode): void {
    this.mode = mode;
  }

  /** Updates the ghost's current facing/movement direction. */
  setDirection(direction: Direction): void {
    this.direction = direction;
  }

  /** Moves the ghost to a new grid position. */
  moveTo(position: GridPosition): void {
    this.position = position;
  }

  /** Reverses the ghost's current direction of travel (180-degree turn). */
  reverseDirection(): void {
    this.direction = OPPOSITE_DIRECTION[this.direction];
  }

  /**
   * Transitions the ghost into scared mode: reverses its current direction
   * of travel, switches its mode to `scared` (driving the uniform
   * vulnerable render color elsewhere), and applies a reduced speed by
   * multiplying its base speed by `speedMultiplier`.
   */
  enterScaredMode(speedMultiplier: number): void {
    this.mode = 'scared';
    this.reverseDirection();
    this.speed = this.baseSpeed * speedMultiplier;
  }

  /** Restores the ghost's normal (non-scared) speed. */
  restoreBaseSpeed(): void {
    this.speed = this.baseSpeed;
  }
}

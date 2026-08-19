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
}

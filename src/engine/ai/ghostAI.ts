/**
 * Target-tile selection logic implementing each ghost's distinct chase
 * personality. Every tick the Game Loop Engine calls `chooseTarget` for
 * each ghost to obtain the tile it should path toward; the actual
 * pathfinding/movement resolution against maze walls happens elsewhere.
 */
import type { Direction } from '../../types';
import { Ghost, type GridPosition } from '../entities/Ghost';

/** Minimal Pac-Man state needed to compute ghost targets. */
export interface PacManState {
  position: GridPosition;
  direction: Direction;
}

/** Number of tiles Pinky targets ahead of Pac-Man's current heading. */
const PINKY_AMBUSH_TILES = 4;

/** Number of tiles ahead of Pac-Man used as Inky's flank pivot point. */
const INKY_PIVOT_TILES = 2;

/** Tile-distance threshold above which Clyde chases directly instead of fleeing. */
const CLYDE_FLEE_DISTANCE = 8;

const DIRECTION_VECTORS: Record<Direction, GridPosition> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

/** Returns the ghost's fixed home-corner target used during scatter mode. */
export function getScatterTarget(ghost: Ghost): GridPosition {
  return ghost.scatterTarget;
}

function offsetTile(origin: GridPosition, direction: Direction, tiles: number): GridPosition {
  const vector = DIRECTION_VECTORS[direction];
  return { x: origin.x + vector.x * tiles, y: origin.y + vector.y * tiles };
}

function tileDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Blinky: direct chase — always targets Pac-Man's current tile. */
function chooseBlinkyTarget(pacman: PacManState): GridPosition {
  return { ...pacman.position };
}

/** Pinky: ambush — targets several tiles ahead of Pac-Man's heading. */
function choosePinkyTarget(pacman: PacManState): GridPosition {
  return offsetTile(pacman.position, pacman.direction, PINKY_AMBUSH_TILES);
}

/**
 * Inky: flank — picks a pivot point ahead of Pac-Man, then targets the
 * tile obtained by reflecting Blinky's position through that pivot.
 */
function chooseInkyTarget(pacman: PacManState, blinky: Ghost): GridPosition {
  const pivot = offsetTile(pacman.position, pacman.direction, INKY_PIVOT_TILES);
  return {
    x: pivot.x + (pivot.x - blinky.position.x),
    y: pivot.y + (pivot.y - blinky.position.y),
  };
}

/**
 * Clyde: chase/scatter wildcard — chases directly like Blinky while far
 * from Pac-Man, but retreats to its scatter corner once within the flee
 * distance threshold.
 */
function chooseClydeTarget(ghost: Ghost, pacman: PacManState): GridPosition {
  const distance = tileDistance(ghost.position, pacman.position);
  return distance > CLYDE_FLEE_DISTANCE ? { ...pacman.position } : getScatterTarget(ghost);
}

/**
 * Computes the grid tile a ghost should target this tick. During scatter
 * mode every ghost retreats to its fixed home corner; otherwise each ghost
 * applies its distinct targeting personality.
 *
 * @param ghost - The ghost choosing a target (provides mode/position/personality).
 * @param pacman - Pac-Man's current position and direction.
 * @param blinky - Blinky's ghost instance, required for Inky's flanking calculation.
 */
export function chooseTarget(ghost: Ghost, pacman: PacManState, blinky: Ghost): GridPosition {
  if (ghost.mode === 'scatter') {
    return getScatterTarget(ghost);
  }

  switch (ghost.name) {
    case 'blinky':
      return chooseBlinkyTarget(pacman);
    case 'pinky':
      return choosePinkyTarget(pacman);
    case 'inky':
      return chooseInkyTarget(pacman, blinky);
    case 'clyde':
      return chooseClydeTarget(ghost, pacman);
  }
}

import { Ghost } from '../entities/Ghost';
import { PacMan } from '../entities/PacMan';
import { Maze } from '../maze/MazeMap';

/** Choose a target tile for the given ghost based on its mode and AI personality. */
export function chooseTarget(
  _ghost: Ghost,
  pacman: PacMan,
  _blinky: Ghost | null,
  _maze: Maze,
): { row: number; col: number } {
  // Stub — returns Pac-Man's position as default target
  return { row: pacman.row, col: pacman.col };
}

/** Get the fixed scatter-mode corner target for a ghost. */
export function getScatterTarget(ghost: Ghost): { row: number; col: number } {
  switch (ghost.name) {
    case 'blinky':
      return { row: 0, col: 25 };
    case 'pinky':
      return { row: 0, col: 2 };
    case 'inky':
      return { row: 30, col: 27 };
    case 'clyde':
      return { row: 30, col: 0 };
  }
}

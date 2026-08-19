import { Direction } from '../../types';

/** Pac-Man entity — stub. Full implementation in a later assignment. */
export class PacMan {
  row: number;
  col: number;
  direction: Direction;

  constructor(row = 23, col = 13, direction: Direction = 'left') {
    this.row = row;
    this.col = col;
    this.direction = direction;
  }
}

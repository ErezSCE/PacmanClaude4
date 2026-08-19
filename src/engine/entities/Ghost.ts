import { Direction, GhostMode } from '../../types';

export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

/** Ghost entity — stub. Full implementation in a later assignment. */
export class Ghost {
  name: GhostName;
  row: number;
  col: number;
  direction: Direction;
  mode: GhostMode;

  constructor(name: GhostName, row: number, col: number) {
    this.name = name;
    this.row = row;
    this.col = col;
    this.direction = 'up';
    this.mode = 'scatter';
  }
}

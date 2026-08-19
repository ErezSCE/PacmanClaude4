import { Tile, Direction } from '../../types';

/**
 * Classic Pac-Man maze layout (28 columns × 31 rows).
 *
 * Legend:
 *   W = wall
 *   . = dot (corridor with dot)
 *   o = power pellet
 *   _ = empty corridor (no dot)
 *   T = tunnel
 *   H = ghost house interior
 *   D = ghost house door
 */
export const MAZE_LAYOUT: string[] = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWWW',
  'WoWWWW.WWWWW.WW.WWWWW.WWWWo',
  'W.WWWW.WWWWW.WW.WWWWW.WWWWW',
  'W..........................W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWWW',
  'W.WWWW.WW.WWWWWWWW.WW.WWWWW',
  'W......WW....WW....WW......W',
  'WWWWWW.WWWWW_WW_WWWWW.WWWWWW',
  '_____W.WWWWW_WW_WWWWW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWW__WWW_WW.W_____',
  'WWWWWW.WW_W_HHHH_W_WW.WWWWWW',
  'TTTTTT.___W_HHHH_W___.TTTTTT',
  'WWWWWW.WW_W_HHHH_W_WW.WWWWWW',
  '_____W.WW_WWWDDWWW_WW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWWWWWWW_WW.W_____',
  'WWWWWW.WW_WWWWWWWW_WW.WWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWWW',
  'W.WWWW.WWWWW.WW.WWWWW.WWWWW',
  'Wo..WW................WW..oW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'W......WW....WW....WW......W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W..........................W',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
];

const TILE_CHAR_MAP: Record<string, Tile> = {
  W: 'wall',
  '.': 'dot',
  o: 'pellet',
  _: 'corridor',
  T: 'tunnel',
  H: 'ghost-house',
  D: 'ghost-door',
  ' ': 'empty',
};

export class Maze {
  readonly width: number;
  readonly height: number;
  private readonly grid: Tile[][];
  private readonly dots: boolean[][];

  constructor(layout: string[] = MAZE_LAYOUT) {
    this.height = layout.length;
    this.width = layout[0].length;
    this.grid = [];
    this.dots = [];

    for (let row = 0; row < this.height; row++) {
      this.grid[row] = [];
      this.dots[row] = [];
      for (let col = 0; col < this.width; col++) {
        const char = layout[row][col];
        const tile = TILE_CHAR_MAP[char] ?? 'empty';
        this.grid[row][col] = tile;
        this.dots[row][col] = tile === 'dot' || tile === 'pellet';
      }
    }
  }

  getTile(row: number, col: number): Tile {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return 'empty';
    }
    return this.grid[row][col];
  }

  hasDot(row: number, col: number): boolean {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return false;
    }
    return this.dots[row][col];
  }

  eatDot(row: number, col: number): Tile | null {
    if (!this.hasDot(row, col)) return null;
    const tile = this.grid[row][col];
    this.dots[row][col] = false;
    return tile;
  }

  isWalkable(row: number, col: number): boolean {
    const tile = this.getTile(row, col);
    return tile !== 'wall' && tile !== 'empty' && tile !== 'ghost-house';
  }

  getNeighbor(row: number, col: number, direction: Direction): { row: number; col: number } {
    switch (direction) {
      case 'up':
        return { row: row - 1, col };
      case 'down':
        return { row: row + 1, col };
      case 'left':
        return { row, col: col - 1 };
      case 'right':
        return { row, col: col + 1 };
    }
  }

  wrapTunnel(row: number, col: number): { row: number; col: number } {
    if (col < 0) return { row, col: this.width - 1 };
    if (col >= this.width) return { row, col: 0 };
    return { row, col };
  }

  getRemainingDots(): number {
    let count = 0;
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.dots[row][col]) count++;
      }
    }
    return count;
  }
}

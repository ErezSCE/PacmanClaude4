/** Tile types in the maze grid */
export type Tile =
  | 'wall'
  | 'corridor'
  | 'dot'
  | 'pellet'
  | 'tunnel'
  | 'ghost-house'
  | 'ghost-door'
  | 'empty';

/** Movement directions */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Ghost behavior modes */
export type GhostMode = 'chase' | 'scatter' | 'scared' | 'eaten';

/** High-level game screen states */
export type GameScreen =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'level-complete'
  | 'game-over';

/** Game configuration */
export interface GameConfig {
  readonly tileSize: number;
  readonly mazeWidthTiles: number;
  readonly mazeHeightTiles: number;
  readonly fps: number;
}

/** Per-level difficulty configuration */
export interface LevelConfig {
  readonly level: number;
  readonly pacmanSpeed: number;
  readonly ghostSpeed: number;
  readonly frightenedSpeed: number;
  readonly frightenedTime: number;
  readonly scatterTime: number;
  readonly chaseTime: number;
  readonly elroyDotsLeft: number;
  readonly elroySpeed: number;
}

/** High score entry */
export interface HighScoreEntry {
  readonly initials: string;
  readonly score: number;
  readonly achievedAt: string;
}

/** Snapshot of game state for rendering */
export interface GameSnapshot {
  readonly screen: GameScreen;
  readonly score: number;
  readonly lives: number;
  readonly level: number;
  readonly highScore: number;
}

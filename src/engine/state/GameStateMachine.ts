/**
 * Game State Machine.
 *
 * Manages the high-level screen/flow state (Start -> Countdown -> Playing ->
 * Paused -> Level Complete -> Game Over), the current level number, and
 * lives tracking. Also owns ghost-collision death detection and the
 * respawn helper used after a death: resetting Pac-Man/ghost positions to
 * their level-start layout while leaving the maze's eaten-dot/pellet
 * bookkeeping completely untouched (that state lives in the Maze module,
 * which this machine never reads or writes).
 *
 * Emits state changes to subscribers (the React UI shell) via
 * {@link GameStateMachine.subscribe}.
 */

import type { GameConfig, GhostMode } from '../../types';

/** High-level screen/flow states the UI shell renders. */
export type GameScreen =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'levelComplete'
  | 'gameOver';

/** Default starting lives / extra-life threshold, matching the classic rules. */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  startingLives: 3,
  extraLifeScoreThreshold: 10000,
};

/** A 2D position in whatever coordinate space the caller (Game Loop) uses. */
export interface EntityPosition {
  x: number;
  y: number;
}

/**
 * The level-start positions Pac-Man and each named ghost respawn to after a
 * death. Contains positions only — no dot/pellet state — so it can never
 * be used to accidentally reset the maze's eaten-dot bookkeeping.
 */
export interface RespawnLayout {
  pacman: EntityPosition;
  ghosts: Readonly<Record<string, EntityPosition>>;
}

/** Snapshot of machine-owned state, emitted to subscribers on every change. */
export interface GameStateSnapshot {
  screen: GameScreen;
  level: number;
  lives: number;
}

/** Listener callback invoked with the latest snapshot on every state change. */
export type GameStateListener = (snapshot: GameStateSnapshot) => void;

/** Ghost modes that represent a fatal contact for Pac-Man if touched. */
const FATAL_GHOST_MODES: readonly GhostMode[] = ['chase', 'scatter'];

/**
 * Manages the game's high-level screen/flow state, level number, lives, and
 * ghost-collision death detection.
 */
export class GameStateMachine {
  private screen: GameScreen = 'start';
  private level = 1;
  private lives: number;
  private readonly listeners: Set<GameStateListener> = new Set();

  /**
   * @param config - Starting lives / extra-life threshold. Defaults to the
   *   classic 3 lives / 10,000pt extra-life rules.
   */
  constructor(private readonly config: GameConfig = DEFAULT_GAME_CONFIG) {
    this.lives = config.startingLives;
  }

  /** Returns the current screen/flow state. */
  getScreen(): GameScreen {
    return this.screen;
  }

  /** Returns the current 1-based level number. */
  getLevel(): number {
    return this.level;
  }

  /** Returns the player's current remaining lives. */
  getLives(): number {
    return this.lives;
  }

  /** Returns a snapshot of all machine-owned state. */
  getSnapshot(): GameStateSnapshot {
    return { screen: this.screen, level: this.level, lives: this.lives };
  }

  /**
   * Starts a brand-new game: resets lives to the configured starting count
   * and the level to 1, then transitions to Countdown.
   */
  startGame(): void {
    this.lives = this.config.startingLives;
    this.level = 1;
    this.screen = 'countdown';
    this.notify();
  }

  /** The pre-round countdown finished; begin active play. */
  beginPlaying(): void {
    if (this.screen !== 'countdown') {
      return;
    }
    this.screen = 'playing';
    this.notify();
  }

  /** Pauses an in-progress game. */
  pause(): void {
    if (this.screen !== 'playing') {
      return;
    }
    this.screen = 'paused';
    this.notify();
  }

  /** Resumes a paused game. */
  resume(): void {
    if (this.screen !== 'paused') {
      return;
    }
    this.screen = 'playing';
    this.notify();
  }

  /** Marks the current level cleared (all dots/pellets eaten). */
  completeLevel(): void {
    if (this.screen !== 'playing') {
      return;
    }
    this.level += 1;
    this.screen = 'levelComplete';
    this.notify();
  }

  /** Advances from the Level Complete screen into the next level's countdown. */
  continueToNextLevel(): void {
    if (this.screen !== 'levelComplete') {
      return;
    }
    this.screen = 'countdown';
    this.notify();
  }

  /**
   * Returns whether contact with a ghost currently in the given mode is
   * fatal to Pac-Man. `scared` ghosts (fleeing, edible) and `eaten` ghosts
   * (eyes returning to the ghost house) are not fatal; `chase` and
   * `scatter` are.
   *
   * @param ghostMode - The ghost's current AI mode.
   */
  static isFatalGhostContact(ghostMode: GhostMode): boolean {
    return FATAL_GHOST_MODES.includes(ghostMode);
  }

  /**
   * Handles a detected Pac-Man/ghost collision during active play.
   *
   * Non-fatal contact (the ghost is `scared` or already `eaten`) is
   * ignored and returns `false`. Fatal contact (`chase`/`scatter`)
   * decrements lives by one and transitions to either a respawn-pending
   * Countdown (lives remain, so the caller should reposition entities via
   * {@link respawnEntities} once the countdown completes) or Game Over
   * (lives exhausted).
   *
   * @param ghostMode - The current mode of the ghost Pac-Man touched.
   * @returns Whether the collision was fatal (a death was triggered).
   */
  handleGhostCollision(ghostMode: GhostMode): boolean {
    if (this.screen !== 'playing') {
      return false;
    }
    if (!GameStateMachine.isFatalGhostContact(ghostMode)) {
      return false;
    }
    this.lives -= 1;
    this.screen = this.lives <= 0 ? 'gameOver' : 'countdown';
    this.notify();
    return true;
  }

  /**
   * Subscribes to state changes.
   *
   * @param listener - Called synchronously with the new snapshot whenever
   *   the screen, level, or lives change.
   * @returns An unsubscribe function.
   */
  subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

/**
 * Resets Pac-Man and ghost positions to a level's starting layout after a
 * death, returning brand-new position objects so callers never end up
 * mutating (or being aliased to) the frozen layout reference passed in.
 *
 * This function only ever operates on entity positions: it takes no
 * maze/dot state as an argument and returns none, so it cannot — even
 * accidentally — reset eaten dots or pellets. The Game Loop Engine calls
 * this alongside resetting ghost AI mode timers while leaving the Maze
 * module's eaten-dot bookkeeping completely untouched, which is what
 * preserves maze-clearing progress across a death.
 *
 * @param layout - The level-start positions for Pac-Man and every ghost.
 * @returns Freshly copied positions for Pac-Man and every ghost.
 */
export function respawnEntities(layout: RespawnLayout): RespawnLayout {
  const ghosts: Record<string, EntityPosition> = {};
  for (const [name, position] of Object.entries(layout.ghosts)) {
    ghosts[name] = { x: position.x, y: position.y };
  }
  return {
    pacman: { x: layout.pacman.x, y: layout.pacman.y },
    ghosts,
  };
}

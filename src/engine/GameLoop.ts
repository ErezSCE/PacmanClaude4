/**
 * Core tick-driven engine loop. This module currently owns the ghost
 * scatter/chase mode timer: every tick it advances a per-level timer and,
 * once the current phase's configured duration elapses, flips all four
 * ghosts simultaneously between scatter and chase mode. While in scatter
 * mode each ghost's target tile is computed via `getScatterTarget`; while
 * chasing it is computed via `chooseTarget`.
 *
 * Ghosts already in `scared` or `eaten` mode (triggered by power pellets,
 * outside this module's scope) are left untouched by the phase flip so a
 * fright/eaten period is not interrupted by the scatter/chase alternation.
 */
import { Ghost, type GhostName, type GridPosition } from './entities/Ghost';
import { chooseTarget, getScatterTarget, type PacManState } from './ai/ghostAI';
import { getLevelConfig } from './levels/levelConfig';
import type { LevelConfig } from '../types';

/** The two alternating ghost-mode phases this loop drives. */
export type ScatterChasePhase = 'scatter' | 'chase';

export interface GameLoopOptions {
  /** The starting level; determines scatter/chase durations and speeds. */
  level: number;
  /** All four ghost entities whose modes/targets this loop drives. */
  ghosts: Ghost[];
  /** Returns Pac-Man's current position/direction for target computation. */
  getPacManState: () => PacManState;
}

/**
 * Drives the per-tick ghost scatter/chase mode timer and target-tile
 * selection. Movement, collision, and scoring are handled by other
 * modules layered on top of this loop.
 */
export class GameLoop {
  private readonly ghosts: Ghost[];
  private readonly getPacManState: () => PacManState;
  private levelConfig: LevelConfig;
  private phase: ScatterChasePhase = 'scatter';
  private phaseElapsedMs = 0;
  private readonly targets = new Map<GhostName, GridPosition>();

  constructor(options: GameLoopOptions) {
    this.ghosts = options.ghosts;
    this.getPacManState = options.getPacManState;
    this.levelConfig = getLevelConfig(options.level);
    this.applyPhaseToGhosts();
    this.updateGhostTargets();
  }

  /** The scatter/chase phase all ghosts are currently in. */
  getPhase(): ScatterChasePhase {
    return this.phase;
  }

  /** The most recently computed target tile for the named ghost. */
  getTarget(name: GhostName): GridPosition | undefined {
    return this.targets.get(name);
  }

  /** Reconfigures the loop for a new level, resetting the phase timer. */
  setLevel(level: number): void {
    this.levelConfig = getLevelConfig(level);
    this.phase = 'scatter';
    this.phaseElapsedMs = 0;
    this.applyPhaseToGhosts();
    this.updateGhostTargets();
  }

  /**
   * Advances the loop by `deltaMs` milliseconds: progresses the scatter/
   * chase phase timer (flipping all ghosts' modes if the phase elapsed)
   * and recomputes each ghost's target tile for the current phase.
   */
  tick(deltaMs: number): void {
    this.advancePhaseTimer(deltaMs);
    this.updateGhostTargets();
  }

  private currentPhaseDurationMs(): number {
    return this.phase === 'scatter'
      ? this.levelConfig.scatterDurationMs
      : this.levelConfig.chaseDurationMs;
  }

  private advancePhaseTimer(deltaMs: number): void {
    this.phaseElapsedMs += deltaMs;

    // Loop in case a large deltaMs skips multiple phase boundaries at once.
    while (this.phaseElapsedMs >= this.currentPhaseDurationMs()) {
      this.phaseElapsedMs -= this.currentPhaseDurationMs();
      this.phase = this.phase === 'scatter' ? 'chase' : 'scatter';
      this.applyPhaseToGhosts();
    }
  }

  private applyPhaseToGhosts(): void {
    for (const ghost of this.ghosts) {
      if (ghost.mode === 'scared' || ghost.mode === 'eaten') {
        continue;
      }
      ghost.setMode(this.phase);
    }
  }

  private updateGhostTargets(): void {
    const pacman = this.getPacManState();
    const blinky = this.ghosts.find((ghost) => ghost.name === 'blinky') ?? this.ghosts[0];

    for (const ghost of this.ghosts) {
      if (ghost.mode === 'scared' || ghost.mode === 'eaten') {
        continue;
      }
      const target =
        this.phase === 'scatter' ? getScatterTarget(ghost) : chooseTarget(ghost, pacman, blinky);
      this.targets.set(ghost.name, target);
    }
  }
}

/** Convenience factory mirroring the `GameLoop` constructor. */
export function createGameLoop(options: GameLoopOptions): GameLoop {
  return new GameLoop(options);
}

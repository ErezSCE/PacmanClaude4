/**
 * Core requestAnimationFrame-driven tick loop. Advances entity positions,
 * resolves collisions, and drives ghost mode timers by invoking a
 * consumer-supplied `onTick` callback once per animation frame.
 *
 * pause()/resume() stop and restart the rAF scheduling without losing any
 * accumulated engine state: no ticks are emitted while paused, and the
 * delta-time clock is reset on resume so the first post-resume tick never
 * reports a huge elapsed-time jump for the time spent paused.
 */

export type TickCallback = (deltaMs: number, tickCount: number) => void;

export interface GameLoopOptions {
  onTick: TickCallback;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  now?: () => number;
}

export class GameLoop {
  private running = false;
  private paused = false;
  private frameHandle: number | null = null;
  private lastTimestamp: number | null = null;
  private tickCount = 0;

  private readonly onTick: TickCallback;
  private readonly requestFrame: (callback: FrameRequestCallback) => number;
  private readonly cancelFrame: (handle: number) => void;
  private readonly now: () => number;

  constructor(options: GameLoopOptions) {
    this.onTick = options.onTick;
    this.requestFrame =
      options.requestFrame ?? ((callback) => requestAnimationFrame(callback));
    this.cancelFrame = options.cancelFrame ?? ((handle) => cancelAnimationFrame(handle));
    this.now = options.now ?? (() => performance.now());
  }

  /** Starts the loop from a fresh state (tick count resets to 0). */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTimestamp = null;
    this.tickCount = 0;
    this.scheduleNextFrame();
  }

  /**
   * Freezes the tick loop: no further onTick invocations occur until
   * resume() is called. All engine state (tick count, entity state held by
   * the consumer) is left untouched.
   */
  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.frameHandle !== null) {
      this.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  /**
   * Resumes ticking from exactly where it left off. The elapsed-time clock
   * is reset so the next tick's delta reflects real frame spacing rather
   * than the (possibly long) paused duration.
   */
  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.lastTimestamp = null;
    this.scheduleNextFrame();
  }

  /** Fully stops the loop; a subsequent start() begins a new run from tick 0. */
  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.frameHandle !== null) {
      this.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
    this.lastTimestamp = null;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  getTickCount(): number {
    return this.tickCount;
  }

  private scheduleNextFrame(): void {
    this.frameHandle = this.requestFrame(this.handleFrame);
  }

  private handleFrame = (timestamp: number): void => {
    if (!this.running || this.paused) return;
    const resolvedTimestamp = timestamp ?? this.now();
    const previous = this.lastTimestamp ?? resolvedTimestamp;
    const deltaMs = resolvedTimestamp - previous;
    this.lastTimestamp = resolvedTimestamp;
    this.tickCount += 1;
    this.onTick(deltaMs, this.tickCount);
    this.scheduleNextFrame();
  };
}

/** Factory matching the module's declared functional export surface. */
export function createGameLoop(options: GameLoopOptions): GameLoop {
  return new GameLoop(options);
}

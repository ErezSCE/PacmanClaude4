import { useEffect, useRef, useState } from 'react';
import type { Direction } from '../types';

export type InputCallbacks = {
  onDirectionChange?: (direction: Direction) => void;
  onTogglePause?: () => void;
  onToggleMute?: () => void;
};

export type InputManagerOptions = {
  /** Injectable clock, primarily for deterministic swipe-velocity tests. */
  now?: () => number;
};

type TouchPoint = { clientX: number; clientY: number };

/**
 * Minimal shape of a browser TouchEvent that InputManager depends on.
 * Kept intentionally narrow (rather than the DOM lib's `TouchEvent`) so
 * that unit tests can simulate gestures with plain objects.
 */
export type MinimalTouchEvent = {
  touches: readonly TouchPoint[];
  changedTouches?: readonly TouchPoint[];
  cancelable?: boolean;
  preventDefault?: () => void;
};

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const PAUSE_KEYS = new Set(['Escape', 'p', 'P']);
const MUTE_KEYS = new Set(['m', 'M']);

/** Minimum straight-line distance (px) for a touch gesture to count as a swipe. */
const SWIPE_MIN_DISTANCE_PX = 24;
/** Minimum speed (px/ms) for a touch gesture to count as a swipe rather than a slow drag. */
const SWIPE_MIN_VELOCITY_PX_MS = 0.15;

/**
 * Normalizes keyboard (arrow keys/WASD), swipe gestures, and on-screen
 * directional buttons into a single 'desired direction' signal consumed
 * by the Game Loop. Also handles pause/mute key bindings.
 */
export class InputManager {
  private direction: Direction = 'none';
  private callbacks: InputCallbacks;
  private now: () => number;
  private touchStart: { x: number; y: number; time: number } | null = null;

  private handleKeyDown = (event: KeyboardEvent): void => {
    const mapped = KEY_TO_DIRECTION[event.key];
    if (mapped) {
      event.preventDefault();
      this.setDirection(mapped);
      return;
    }
    if (PAUSE_KEYS.has(event.key)) {
      event.preventDefault();
      this.callbacks.onTogglePause?.();
      return;
    }
    if (MUTE_KEYS.has(event.key)) {
      event.preventDefault();
      this.callbacks.onToggleMute?.();
    }
  };

  private handleTouchStart = (event: MinimalTouchEvent): void => {
    const touch = event.touches[0];
    if (!touch) return;
    this.touchStart = { x: touch.clientX, y: touch.clientY, time: this.now() };
  };

  private handleTouchMove = (event: MinimalTouchEvent): void => {
    // Suppress page scroll/bounce while a swipe gesture is in progress.
    if (this.touchStart && event.cancelable !== false) {
      event.preventDefault?.();
    }
  };

  private handleTouchEnd = (event: MinimalTouchEvent): void => {
    const start = this.touchStart;
    this.touchStart = null;
    if (!start) return;

    const touch = event.changedTouches?.[0] ?? event.touches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const distance = Math.hypot(dx, dy);
    if (distance < SWIPE_MIN_DISTANCE_PX) {
      return; // Too short - treat as an accidental tap.
    }

    const elapsed = Math.max(this.now() - start.time, 1);
    const velocity = distance / elapsed;
    if (velocity < SWIPE_MIN_VELOCITY_PX_MS) {
      return; // Too slow - treat as an accidental drag, not a swipe.
    }

    const direction: Direction =
      Math.abs(dx) >= Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up';

    this.setDirection(direction);
  };

  constructor(callbacks: InputCallbacks = {}, options: InputManagerOptions = {}) {
    this.callbacks = callbacks;
    this.now = options.now ?? (() => Date.now());
  }

  attach(target: EventTarget = window): () => void {
    target.addEventListener('keydown', this.handleKeyDown as EventListener);
    target.addEventListener('touchstart', this.handleTouchStart as EventListener, {
      passive: true,
    } as AddEventListenerOptions);
    target.addEventListener('touchmove', this.handleTouchMove as EventListener, {
      passive: false,
    } as AddEventListenerOptions);
    target.addEventListener('touchend', this.handleTouchEnd as EventListener);
    return () => this.detach(target);
  }

  detach(target: EventTarget = window): void {
    target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    target.removeEventListener('touchstart', this.handleTouchStart as EventListener);
    target.removeEventListener('touchmove', this.handleTouchMove as EventListener);
    target.removeEventListener('touchend', this.handleTouchEnd as EventListener);
  }

  setDirection(direction: Direction): void {
    this.direction = direction;
    this.callbacks.onDirectionChange?.(direction);
  }

  getDirection(): Direction {
    return this.direction;
  }

  simulateKeyDown(event: Pick<KeyboardEvent, 'key' | 'preventDefault'>): void {
    this.handleKeyDown(event as KeyboardEvent);
  }

  /** Test/production helper: begins a swipe gesture at the given touch point. */
  simulateTouchStart(event: MinimalTouchEvent): void {
    this.handleTouchStart(event);
  }

  /** Test/production helper: reports a touch-move while a swipe is in progress. */
  simulateTouchMove(event: MinimalTouchEvent): void {
    this.handleTouchMove(event);
  }

  /** Test/production helper: ends a swipe gesture, normalizing it into a direction change. */
  simulateTouchEnd(event: MinimalTouchEvent): void {
    this.handleTouchEnd(event);
  }
}

/**
 * React hook wrapping InputManager: attaches keyboard and touch/swipe
 * listeners for the lifetime of the consuming component and exposes the
 * current desired direction plus pause/mute toggle handlers.
 */
export function useInput(callbacks: InputCallbacks = {}): {
  direction: Direction;
  manager: InputManager;
} {
  const [direction, setDirectionState] = useState<Direction>('none');
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const managerRef = useRef<InputManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new InputManager({
      onDirectionChange: (dir) => {
        setDirectionState(dir);
        callbacksRef.current.onDirectionChange?.(dir);
      },
      onTogglePause: () => callbacksRef.current.onTogglePause?.(),
      onToggleMute: () => callbacksRef.current.onToggleMute?.(),
    });
  }

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return undefined;
    return manager.attach(window);
  }, []);

  return { direction, manager: managerRef.current };
}

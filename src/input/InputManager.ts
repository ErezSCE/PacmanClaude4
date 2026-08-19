import { useEffect, useRef, useState } from 'react';
import type { Direction } from '../types';

export type InputCallbacks = {
  onDirectionChange?: (direction: Direction) => void;
  onTogglePause?: () => void;
  onToggleMute?: () => void;
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

/**
 * Normalizes keyboard (arrow keys/WASD), swipe gestures, and on-screen
 * directional buttons into a single 'desired direction' signal consumed
 * by the Game Loop. Also handles pause/mute key bindings.
 */
export class InputManager {
  private direction: Direction = 'none';
  private callbacks: InputCallbacks;
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

  constructor(callbacks: InputCallbacks = {}) {
    this.callbacks = callbacks;
  }

  attach(target: EventTarget = window): () => void {
    target.addEventListener('keydown', this.handleKeyDown as EventListener);
    return () => this.detach(target);
  }

  detach(target: EventTarget = window): void {
    target.removeEventListener('keydown', this.handleKeyDown as EventListener);
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
}

/**
 * React hook wrapping InputManager: attaches keyboard listeners for the
 * lifetime of the consuming component and exposes the current desired
 * direction plus pause/mute toggle handlers.
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

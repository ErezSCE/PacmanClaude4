import { Direction } from '../types';

/** Input Manager — stub. Full implementation in a later assignment. */
export class InputManager {
  private desiredDirection: Direction | null = null;

  getDesiredDirection(): Direction | null {
    return this.desiredDirection;
  }

  setDesiredDirection(direction: Direction | null): void {
    this.desiredDirection = direction;
  }

  destroy(): void {
    this.desiredDirection = null;
  }
}

/** React hook for input — stub. */
export function useInput(): Direction | null {
  return null;
}

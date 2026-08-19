/** Game Loop Engine — stub. Full implementation in a later assignment. */
export class GameLoop {
  private running = false;

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}

export function createGameLoop(): GameLoop {
  return new GameLoop();
}

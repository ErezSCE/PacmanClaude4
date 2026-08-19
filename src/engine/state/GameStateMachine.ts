export type GameScreen =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'level-complete'
  | 'game-over';

/** Game State Machine — stub. Full implementation in a later assignment. */
export class GameStateMachine {
  private screen: GameScreen = 'start';

  getScreen(): GameScreen {
    return this.screen;
  }

  setScreen(screen: GameScreen): void {
    this.screen = screen;
  }
}

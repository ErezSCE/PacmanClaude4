import { describe, it, expect } from 'vitest';

import {
  GameStateMachine,
  respawnEntities,
  DEFAULT_GAME_CONFIG,
  type RespawnLayout,
} from './GameStateMachine';

describe('GameStateMachine', () => {
  describe('[US-016#1] starting lives', () => {
    it('starts each game with exactly 3 lives', () => {
      const machine = new GameStateMachine();

      expect(machine.getLives()).toBe(3);
      expect(machine.getLives()).toBe(DEFAULT_GAME_CONFIG.startingLives);
    });

    it('resets lives to the configured starting count on startGame', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();
      machine.handleGhostCollision('chase');

      machine.startGame();

      expect(machine.getLives()).toBe(3);
      expect(machine.getScreen()).toBe('countdown');
    });
  });

  describe('[US-016#2] death detection on non-scared ghost contact', () => {
    it('decrements lives by 1 when Pac-Man touches a chasing ghost', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      const wasFatal = machine.handleGhostCollision('chase');

      expect(wasFatal).toBe(true);
      expect(machine.getLives()).toBe(2);
    });

    it('decrements lives by 1 when Pac-Man touches a scattering ghost', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      const wasFatal = machine.handleGhostCollision('scatter');

      expect(wasFatal).toBe(true);
      expect(machine.getLives()).toBe(2);
    });

    it('does not decrement lives when the ghost is scared', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      const wasFatal = machine.handleGhostCollision('scared');

      expect(wasFatal).toBe(false);
      expect(machine.getLives()).toBe(3);
      expect(machine.getScreen()).toBe('playing');
    });

    it('does not decrement lives when the ghost is already eaten (eyes)', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      const wasFatal = machine.handleGhostCollision('eaten');

      expect(wasFatal).toBe(false);
      expect(machine.getLives()).toBe(3);
    });

    it('transitions to a respawn-pending countdown after a fatal death with lives remaining', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      machine.handleGhostCollision('chase');

      expect(machine.getScreen()).toBe('countdown');
    });

    it('exposes the fatal-contact rule as a static predicate', () => {
      expect(GameStateMachine.isFatalGhostContact('chase')).toBe(true);
      expect(GameStateMachine.isFatalGhostContact('scatter')).toBe(true);
      expect(GameStateMachine.isFatalGhostContact('scared')).toBe(false);
      expect(GameStateMachine.isFatalGhostContact('eaten')).toBe(false);
    });

    it('ignores ghost collisions when not actively playing', () => {
      const machine = new GameStateMachine();

      const wasFatal = machine.handleGhostCollision('chase');

      expect(wasFatal).toBe(false);
      expect(machine.getLives()).toBe(3);
    });

    it('notifies subscribers with the updated snapshot on a fatal collision', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();
      const snapshots: Array<{ screen: string; lives: number }> = [];
      machine.subscribe((snapshot) => snapshots.push(snapshot));

      machine.handleGhostCollision('chase');

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]).toEqual({ screen: 'countdown', level: 1, lives: 2 });
    });
  });

  describe('[US-016#3] respawn preserves dot/pellet state', () => {
    const levelLayout: RespawnLayout = {
      pacman: { x: 14, y: 23 },
      ghosts: {
        blinky: { x: 13, y: 11 },
        pinky: { x: 14, y: 11 },
        inky: { x: 13, y: 14 },
        clyde: { x: 15, y: 14 },
      },
    };

    it('resets Pac-Man and ghost positions back to the level-start layout', () => {
      const respawned = respawnEntities(levelLayout);

      expect(respawned.pacman).toEqual({ x: 14, y: 23 });
      expect(respawned.ghosts.blinky).toEqual({ x: 13, y: 11 });
      expect(respawned.ghosts.pinky).toEqual({ x: 14, y: 11 });
      expect(respawned.ghosts.inky).toEqual({ x: 13, y: 14 });
      expect(respawned.ghosts.clyde).toEqual({ x: 15, y: 14 });
    });

    it('returns fresh copies rather than aliases of the input layout', () => {
      const respawned = respawnEntities(levelLayout);
      respawned.pacman.x = 999;
      respawned.ghosts.blinky.x = 999;

      expect(levelLayout.pacman.x).toBe(14);
      expect(levelLayout.ghosts.blinky.x).toBe(13);
    });

    it('leaves an independent eaten-dot data structure completely untouched', () => {
      // Simulates the Maze module's eaten-dot bookkeeping, kept entirely
      // separate from entity positions.
      const eatenDots = new Set<string>(['3,4', '5,6', '7,8']);
      const eatenDotsSnapshotBefore = new Set(eatenDots);

      respawnEntities(levelLayout);

      expect(eatenDots).toEqual(eatenDotsSnapshotBefore);
      expect(eatenDots.size).toBe(3);
    });

    it('preserves dot state across a full death -> respawn cycle via the state machine', () => {
      const machine = new GameStateMachine();
      const eatenDots = new Set<string>(['1,1', '2,2']);
      machine.startGame();
      machine.beginPlaying();

      machine.handleGhostCollision('chase');
      const respawned = respawnEntities(levelLayout);

      expect(machine.getLives()).toBe(2);
      expect(respawned.pacman).toEqual(levelLayout.pacman);
      expect(eatenDots.size).toBe(2);
      expect(eatenDots.has('1,1')).toBe(true);
      expect(eatenDots.has('2,2')).toBe(true);
    });
  });

  describe('[US-016#4] game over on lives exhausted', () => {
    it('transitions to a respawn countdown (not Game Over) after the first death', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      machine.handleGhostCollision('chase');

      expect(machine.getLives()).toBe(2);
      expect(machine.getScreen()).toBe('countdown');
    });

    it('reaches Game Over after losing all 3 lives across successive deaths', () => {
      const machine = new GameStateMachine();
      machine.startGame();
      machine.beginPlaying();

      machine.handleGhostCollision('chase');
      expect(machine.getLives()).toBe(2);
      expect(machine.getScreen()).toBe('countdown');

      // Countdown completes, resuming play for life #2.
      (machine as unknown as { screen: string }).screen = 'playing';
      machine.handleGhostCollision('chase');
      expect(machine.getLives()).toBe(1);

      (machine as unknown as { screen: string }).screen = 'playing';
      machine.handleGhostCollision('chase');
      expect(machine.getLives()).toBe(0);
      expect(machine.getScreen()).toBe('gameOver');
    });

    it('does not go below 0 lives and stays on Game Over for further collisions', () => {
      const machine = new GameStateMachine(DEFAULT_GAME_CONFIG);
      (machine as unknown as { lives: number; screen: string }).lives = 1;
      (machine as unknown as { screen: string }).screen = 'playing';

      const wasFatal = machine.handleGhostCollision('chase');

      expect(wasFatal).toBe(true);
      expect(machine.getLives()).toBe(0);
      expect(machine.getScreen()).toBe('gameOver');
    });
  });
});

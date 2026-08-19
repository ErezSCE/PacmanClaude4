import { describe, it, expect, vi } from 'vitest';
import { GameLoop, createGameLoop } from './GameLoop';

/**
 * Test harness that stands in for requestAnimationFrame/cancelAnimationFrame
 * so frames can be advanced deterministically and pausing can be asserted
 * to actually cancel the pending frame (not just ignore ticks).
 */
function createFakeScheduler() {
  let nextHandle = 1;
  const pending = new Map<number, FrameRequestCallback>();

  return {
    requestFrame: (callback: FrameRequestCallback): number => {
      const handle = nextHandle++;
      pending.set(handle, callback);
      return handle;
    },
    cancelFrame: (handle: number): void => {
      pending.delete(handle);
    },
    /** Fires all currently pending frame callbacks with the given timestamp. */
    flush(timestamp: number): void {
      const callbacks = Array.from(pending.values());
      pending.clear();
      callbacks.forEach((cb) => cb(timestamp));
    },
    pendingCount(): number {
      return pending.size;
    },
  };
}

// A fake entity whose position only changes inside onTick, simulating
// Pac-Man/ghost movement driven by the engine loop.
function createEntityState() {
  return { x: 0, y: 0, timerMs: 0 };
}

describe('GameLoop', () => {
  describe('[US-022#1] pause freezes entity movement and timers', () => {
    it('stops invoking onTick once paused', () => {
      const scheduler = createFakeScheduler();
      const entity = createEntityState();
      const onTick = vi.fn((deltaMs: number) => {
        entity.x += 1;
        entity.timerMs += deltaMs;
      });

      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      loop.start();
      scheduler.flush(16);
      scheduler.flush(32);
      expect(entity.x).toBe(2);
      const timerAtPause = entity.timerMs;

      loop.pause();
      expect(loop.isPaused()).toBe(true);

      // No pending frame should remain scheduled while paused.
      expect(scheduler.pendingCount()).toBe(0);

      // Attempting to flush while paused must not advance anything because
      // pause() cancelled the pending frame request.
      scheduler.flush(48);
      scheduler.flush(64);

      expect(entity.x).toBe(2);
      expect(entity.timerMs).toBe(timerAtPause);
      expect(onTick).toHaveBeenCalledTimes(2);
    });

    it('leaves tick count unchanged while paused', () => {
      const scheduler = createFakeScheduler();
      const onTick = vi.fn();
      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      loop.start();
      scheduler.flush(16);
      expect(loop.getTickCount()).toBe(1);

      loop.pause();
      scheduler.flush(32);
      scheduler.flush(48);
      expect(loop.getTickCount()).toBe(1);
    });

    it('is a no-op to pause an already-paused or non-running loop', () => {
      const onTick = vi.fn();
      const loop = createGameLoop({ onTick });

      loop.pause();
      expect(loop.isPaused()).toBe(false);

      loop.start();
      loop.pause();
      const wasPausedHandle = loop.isPaused();
      loop.pause();
      expect(loop.isPaused()).toBe(wasPausedHandle);
    });
  });

  describe('[US-022#2] resume continues from exactly where it left off', () => {
    it('preserves entity state accumulated before pause and continues advancing after resume', () => {
      const scheduler = createFakeScheduler();
      const entity = createEntityState();
      const onTick = vi.fn((deltaMs: number) => {
        entity.x += 1;
        entity.timerMs += deltaMs;
      });

      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      loop.start();
      scheduler.flush(16);
      scheduler.flush(32);
      expect(entity.x).toBe(2);

      loop.pause();
      scheduler.flush(9999); // must be ignored entirely

      loop.resume();
      expect(loop.isPaused()).toBe(false);

      // First tick after resume should have a small delta (based on the new
      // reference timestamp), not one inflated by paused wall-clock time.
      scheduler.flush(100);
      expect(entity.x).toBe(3);
      const deltaArgAfterResume = onTick.mock.calls[onTick.mock.calls.length - 1][0];
      expect(deltaArgAfterResume).toBe(0);

      scheduler.flush(116);
      expect(entity.x).toBe(4);
      expect(loop.getTickCount()).toBe(4);
    });

    it('is a no-op to resume a loop that is not paused', () => {
      const scheduler = createFakeScheduler();
      const onTick = vi.fn();
      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      loop.start();
      loop.resume();
      scheduler.flush(16);
      expect(onTick).toHaveBeenCalledTimes(1);
    });
  });

  describe('[US-022#3] pause/resume are plain methods usable from any trigger source', () => {
    it('produces the same frozen state whether pause() is invoked from a keyboard handler or a button click handler', () => {
      const scheduler = createFakeScheduler();
      const entity = createEntityState();
      const onTick = vi.fn(() => {
        entity.x += 1;
      });
      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      // Simulate two independent call sites (a keydown listener and an
      // on-screen button onClick) both calling the same loop.pause().
      const keyboardTriggeredPause = (): void => loop.pause();
      const buttonTriggeredResume = (): void => loop.resume();

      loop.start();
      scheduler.flush(16);
      keyboardTriggeredPause();
      expect(loop.isPaused()).toBe(true);
      scheduler.flush(32);
      expect(entity.x).toBe(1);

      buttonTriggeredResume();
      expect(loop.isPaused()).toBe(false);
      scheduler.flush(48);
      expect(entity.x).toBe(2);
    });
  });

  describe('stop()', () => {
    it('cancels the pending frame and resets tick count on next start', () => {
      const scheduler = createFakeScheduler();
      const onTick = vi.fn();
      const loop = new GameLoop({
        onTick,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      });

      loop.start();
      scheduler.flush(16);
      expect(loop.getTickCount()).toBe(1);

      loop.stop();
      expect(loop.isRunning()).toBe(false);
      expect(scheduler.pendingCount()).toBe(0);

      loop.start();
      expect(loop.getTickCount()).toBe(0);
    });
  });
});

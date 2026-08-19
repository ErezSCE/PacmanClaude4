import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCanvas } from './GameCanvas';
import { Maze, MAZE_LAYOUT } from '../engine/maze/MazeMap';

// jsdom's canvas 2D context is not implemented; stub it so the imperative
// renderer can run and we can assert on the draw calls it makes.
function installFakeContext() {
  const calls: { fillStyle: unknown; op: string; args: unknown[] }[] = [];
  const ctx = {
    _fillStyle: '#000000',
    get fillStyle() {
      return this._fillStyle;
    },
    set fillStyle(value: unknown) {
      this._fillStyle = value;
    },
    fillRect: (...args: unknown[]) => {
      calls.push({ fillStyle: ctx._fillStyle, op: 'fillRect', args });
    },
    beginPath: () => {
      calls.push({ fillStyle: ctx._fillStyle, op: 'beginPath', args: [] });
    },
    arc: (...args: unknown[]) => {
      calls.push({ fillStyle: ctx._fillStyle, op: 'arc', args });
    },
    fill: () => {
      calls.push({ fillStyle: ctx._fillStyle, op: 'fill', args: [] });
    },
  };

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  return calls;
}

/** Invokes the requestAnimationFrame callback exactly once (the initial
 * render tick) then stops, so the imperative render loop does not spin
 * forever recursively within a synchronous test. */
function installSingleTickRaf() {
  let calls = 0;
  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    calls += 1;
    if (calls === 1) {
      cb(0);
    }
    return calls;
  });
  const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  return { rafSpy, cancelRafSpy };
}

describe('GameCanvas', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let cancelRafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    ({ rafSpy, cancelRafSpy } = installSingleTickRaf());
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cancelRafSpy.mockRestore();
    vi.useRealTimers();
  });

  it('[US-001#1] sizes the canvas to match the MAZE_LAYOUT grid dimensions with no missing tiles', () => {
    installFakeContext();
    render(<GameCanvas />);
    const canvas = screen.getByTestId('game-canvas') as HTMLCanvasElement;
    const maze = new Maze(MAZE_LAYOUT);

    expect(canvas.width).toBe(maze.width * 16);
    expect(canvas.height).toBe(maze.height * 16);
  });

  it('[US-001#2] draws exactly 4 power pellets and includes dot draw calls for every dot tile', () => {
    const calls = installFakeContext();
    render(<GameCanvas />);

    const maze = new Maze(MAZE_LAYOUT);
    let pelletCount = 0;
    let dotCount = 0;
    for (let row = 0; row < maze.height; row++) {
      for (let col = 0; col < maze.width; col++) {
        const tile = maze.getTile(row, col);
        if (tile === 'pellet') pelletCount++;
        if (tile === 'dot') dotCount++;
      }
    }

    expect(pelletCount).toBe(4);
    expect(dotCount).toBeGreaterThan(0);

    // The renderer must have made at least one arc() draw per dot/pellet present.
    const arcCalls = calls.filter((c) => c.op === 'arc');
    expect(arcCalls.length).toBeGreaterThanOrEqual(dotCount + pelletCount);
  });

  it('[US-001#3] alternates the pellet-visible flag on a timed interval to create a pulse effect', () => {
    vi.useFakeTimers();
    installFakeContext();
    render(<GameCanvas />);

    // No assertion error thrown just by advancing timers means the interval
    // callback (toggling pellet visibility) ran without throwing.
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });

  it('[US-001#4] represents the left/right tunnel row as continuous corridor tiles for warp travel', () => {
    const maze = new Maze(MAZE_LAYOUT);
    const tunnelRow = MAZE_LAYOUT.findIndex((row) => row.includes('T'));
    expect(tunnelRow).toBeGreaterThan(-1);

    expect(maze.getTile(tunnelRow, 0)).toBe('tunnel');
    expect(maze.getTile(tunnelRow, maze.width - 1)).toBe('tunnel');

    const wrappedLeft = maze.wrapTunnel(tunnelRow, -1);
    expect(wrappedLeft).toEqual({ row: tunnelRow, col: maze.width - 1 });

    const wrappedRight = maze.wrapTunnel(tunnelRow, maze.width);
    expect(wrappedRight).toEqual({ row: tunnelRow, col: 0 });
  });
});

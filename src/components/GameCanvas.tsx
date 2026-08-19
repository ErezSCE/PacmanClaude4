import { useRef, useEffect, useCallback } from 'react';
import { Maze, MAZE_LAYOUT } from '../engine/maze/MazeMap';
import { Tile } from '../types';

const TILE_SIZE = 16;
const PELLET_PULSE_INTERVAL = 200;

const WALL_COLOR = '#2121DE';
const DOT_COLOR = '#FFCC99';
const PELLET_COLOR = '#FFCC99';
const CORRIDOR_COLOR = '#000000';
const GHOST_HOUSE_COLOR = '#000000';
const GHOST_DOOR_COLOR = '#FFB8FF';
const TUNNEL_COLOR = '#000000';
const BACKGROUND_COLOR = '#000000';

function drawMaze(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  showPellets: boolean,
): void {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, maze.width * TILE_SIZE, maze.height * TILE_SIZE);

  for (let row = 0; row < maze.height; row++) {
    for (let col = 0; col < maze.width; col++) {
      const tile = maze.getTile(row, col);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      drawTile(ctx, tile, x, y, maze.hasDot(row, col), showPellets);
    }
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  hasDot: boolean,
  showPellets: boolean,
): void {
  switch (tile) {
    case 'wall':
      ctx.fillStyle = WALL_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;

    case 'dot':
      ctx.fillStyle = CORRIDOR_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      if (hasDot) {
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'pellet':
      ctx.fillStyle = CORRIDOR_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      if (hasDot && showPellets) {
        ctx.fillStyle = PELLET_COLOR;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'corridor':
      ctx.fillStyle = CORRIDOR_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;

    case 'tunnel':
      ctx.fillStyle = TUNNEL_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;

    case 'ghost-house':
      ctx.fillStyle = GHOST_HOUSE_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;

    case 'ghost-door':
      ctx.fillStyle = CORRIDOR_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = GHOST_DOOR_COLOR;
      ctx.fillRect(x, y + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
      break;

    default:
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      break;
  }
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mazeRef = useRef<Maze>(new Maze(MAZE_LAYOUT));
  const pelletVisibleRef = useRef(true);
  const animFrameRef = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMaze(ctx, mazeRef.current, pelletVisibleRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maze = mazeRef.current;
    canvas.width = maze.width * TILE_SIZE;
    canvas.height = maze.height * TILE_SIZE;

    // Pellet pulse timer
    const pelletTimer = setInterval(() => {
      pelletVisibleRef.current = !pelletVisibleRef.current;
    }, PELLET_PULSE_INTERVAL);

    // Animation loop
    const tick = () => {
      render();
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearInterval(pelletTimer);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  const maze = mazeRef.current;

  return (
    <canvas
      ref={canvasRef}
      data-testid="game-canvas"
      width={maze.width * TILE_SIZE}
      height={maze.height * TILE_SIZE}
      aria-label="Pac-Man game maze"
      role="img"
      style={{ display: 'block', margin: '0 auto', imageRendering: 'pixelated' }}
    />
  );
}

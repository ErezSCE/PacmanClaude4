import React, { useRef, useEffect } from 'react';
import { getItem } from '../services/storage';
import { GHOST_PALETTES } from '../data/palettes';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get colorblind preference from storage
    const isColorblindMode = getItem('colorblind_palette_enabled') === 'true';

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Example: Draw a test ghost to verify palette selection
    // This is a placeholder - the actual game loop will render the full game
    const ghostPalette = isColorblindMode ? GHOST_PALETTES.colorblind : GHOST_PALETTES.default;

    // Draw a simple test pattern showing which palette is active
    ctx.fillStyle = ghostPalette.blinky;
    ctx.fillRect(10, 10, 30, 30);

    ctx.fillStyle = ghostPalette.pinky;
    ctx.fillRect(50, 10, 30, 30);

    ctx.fillStyle = ghostPalette.inky;
    ctx.fillRect(90, 10, 30, 30);

    ctx.fillStyle = ghostPalette.clyde;
    ctx.fillRect(130, 10, 30, 30);

    // Display mode indicator
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(isColorblindMode ? 'Colorblind Mode' : 'Normal Mode', 10, 60);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '1px solid #ccc',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
};

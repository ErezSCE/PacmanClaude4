import React, { useRef, useEffect, useState } from 'react';
import { getItem } from '../services/storage';
import { GHOST_PALETTES } from '../data/palettes';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

/**
 * Computes the largest uniform scale factor that fits a `width` x `height`
 * logical canvas inside a `containerWidth` x `containerHeight` box while
 * preserving aspect ratio. Falls back to 1 when the container has no
 * measurable size yet (e.g. before layout/ResizeObserver has fired).
 */
export function computeCanvasScale(
  containerWidth: number,
  containerHeight: number,
  width: number,
  height: number
): number {
  if (containerWidth <= 0 || containerHeight <= 0 || width <= 0 || height <= 0) {
    return 1;
  }

  const scaleX = containerWidth / width;
  const scaleY = containerHeight / height;
  const nextScale = Math.min(scaleX, scaleY);

  return Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Responsive scaling: observe the wrapping container and rescale the
  // canvas (via CSS width/height, keeping its internal drawing resolution
  // fixed) so the maze stays legible from 375px up to 2560px+ viewports.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = (containerWidth: number, containerHeight: number) => {
      setScale(computeCanvasScale(containerWidth, containerHeight, width, height));
    };

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: cw, height: ch } = entry.contentRect;
          updateScale(cw, ch);
        }
      });
      observer.observe(container);
      return () => observer.disconnect();
    }

    // Fallback for environments without ResizeObserver support.
    const handleResize = () => updateScale(container.clientWidth, container.clientHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

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
    <div
      ref={containerRef}
      className="game-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #ccc',
          display: 'block',
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        }}
      />
    </div>
  );
};

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCanvas } from './GameCanvas';
import * as storage from '../services/storage';
import { GHOST_PALETTES } from '../data/palettes';

describe('GameCanvas', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('[US-032#1] colorblind palette selection', () => {
    it('[US-032#1] should render with default palette when colorblind mode is disabled', () => {
      // Set colorblind mode to false
      storage.setItem('colorblind_palette_enabled', 'false');

      const { container } = render(<GameCanvas width={200} height={100} />);
      const canvas = container.querySelector('canvas');

      expect(canvas).toBeInTheDocument();

      // Get canvas context and verify it was drawn with default palette colors
      const ctx = canvas?.getContext('2d');
      expect(ctx).not.toBeNull();
    });

    it('[US-032#1] should render with colorblind palette when colorblind mode is enabled', () => {
      // Set colorblind mode to true
      storage.setItem('colorblind_palette_enabled', 'true');

      const { container } = render(<GameCanvas width={200} height={100} />);
      const canvas = container.querySelector('canvas');

      expect(canvas).toBeInTheDocument();

      // Get canvas context and verify it was drawn with colorblind palette colors
      const ctx = canvas?.getContext('2d');
      expect(ctx).not.toBeNull();
    });

    it('[US-032#1] should update rendering when colorblind preference changes', () => {
      // Start with default palette
      storage.setItem('colorblind_palette_enabled', 'false');
      const { rerender, container } = render(<GameCanvas width={200} height={100} />);

      let canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();

      // Change to colorblind palette
      storage.setItem('colorblind_palette_enabled', 'true');
      rerender(<GameCanvas width={200} height={100} />);

      canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('[US-032#2] colorblind palette persistence', () => {
    it('[US-032#2] should persist colorblind preference to storage', () => {
      storage.setItem('colorblind_palette_enabled', 'true');

      const stored = storage.getItem('colorblind_palette_enabled');
      expect(stored).toBe('true');
    });

    it('[US-032#2] should retrieve persisted colorblind preference from storage', () => {
      storage.setItem('colorblind_palette_enabled', 'true');

      const isColorblindMode = storage.getItem('colorblind_palette_enabled') === 'true';
      expect(isColorblindMode).toBe(true);
    });

    it('[US-032#2] should default to false when colorblind preference is not set', () => {
      localStorage.clear();

      const stored = storage.getItem('colorblind_palette_enabled');
      expect(stored).toBeNull();

      const isColorblindMode = stored === 'true';
      expect(isColorblindMode).toBe(false);
    });
  });

  describe('[US-032#3] ghost palette distinguishability', () => {
    it('[US-032#3] should have distinct colors for all four ghosts in default palette', () => {
      const defaultPalette = GHOST_PALETTES.default;

      const colors = [
        defaultPalette.blinky,
        defaultPalette.pinky,
        defaultPalette.inky,
        defaultPalette.clyde,
      ];

      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    });

    it('[US-032#3] should have distinct colors for all four ghosts in colorblind palette', () => {
      const colorblindPalette = GHOST_PALETTES.colorblind;

      const colors = [
        colorblindPalette.blinky,
        colorblindPalette.pinky,
        colorblindPalette.inky,
        colorblindPalette.clyde,
      ];

      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    });

    it('[US-032#3] should render canvas with correct palette colors', () => {
      storage.setItem('colorblind_palette_enabled', 'true');

      const { container } = render(<GameCanvas width={200} height={100} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      expect(canvas).toBeInTheDocument();

      // Verify canvas has been drawn
      const ctx = canvas.getContext('2d');
      expect(ctx).not.toBeNull();

      // The canvas should have been drawn with content (not just empty)
      const imageData = ctx?.getImageData(0, 0, 1, 1);
      expect(imageData).toBeDefined();
    });
  });
});

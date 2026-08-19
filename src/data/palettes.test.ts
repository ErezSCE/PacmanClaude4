import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PALETTE,
  COLORBLIND_PALETTE,
  getPalette,
  type GhostPalette,
  type PaletteSet,
} from './palettes';

describe('Palettes', () => {
  describe('[US-032#1] DEFAULT_PALETTE', () => {
    it('should have all four ghosts defined', () => {
      expect(DEFAULT_PALETTE).toHaveProperty('blinky');
      expect(DEFAULT_PALETTE).toHaveProperty('pinky');
      expect(DEFAULT_PALETTE).toHaveProperty('inky');
      expect(DEFAULT_PALETTE).toHaveProperty('clyde');
    });

    it('should have primary and eyes colors for each ghost', () => {
      const ghosts: (keyof PaletteSet)[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghosts.forEach((ghostName) => {
        const ghost = DEFAULT_PALETTE[ghostName];
        expect(ghost).toHaveProperty('primary');
        expect(ghost).toHaveProperty('eyes');
        expect(typeof ghost.primary).toBe('string');
        expect(typeof ghost.eyes).toBe('string');
      });
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      const ghosts: (keyof PaletteSet)[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghosts.forEach((ghostName) => {
        const ghost = DEFAULT_PALETTE[ghostName];
        expect(ghost.primary).toMatch(hexColorRegex);
        expect(ghost.eyes).toMatch(hexColorRegex);
      });
    });

    it('should have distinct primary colors for each ghost', () => {
      const colors = [
        DEFAULT_PALETTE.blinky.primary,
        DEFAULT_PALETTE.pinky.primary,
        DEFAULT_PALETTE.inky.primary,
        DEFAULT_PALETTE.clyde.primary,
      ];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    });
  });

  describe('[US-032#1] COLORBLIND_PALETTE', () => {
    it('should have all four ghosts defined', () => {
      expect(COLORBLIND_PALETTE).toHaveProperty('blinky');
      expect(COLORBLIND_PALETTE).toHaveProperty('pinky');
      expect(COLORBLIND_PALETTE).toHaveProperty('inky');
      expect(COLORBLIND_PALETTE).toHaveProperty('clyde');
    });

    it('should have primary and eyes colors for each ghost', () => {
      const ghosts: (keyof PaletteSet)[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghosts.forEach((ghostName) => {
        const ghost = COLORBLIND_PALETTE[ghostName];
        expect(ghost).toHaveProperty('primary');
        expect(ghost).toHaveProperty('eyes');
        expect(typeof ghost.primary).toBe('string');
        expect(typeof ghost.eyes).toBe('string');
      });
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      const ghosts: (keyof PaletteSet)[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghosts.forEach((ghostName) => {
        const ghost = COLORBLIND_PALETTE[ghostName];
        expect(ghost.primary).toMatch(hexColorRegex);
        expect(ghost.eyes).toMatch(hexColorRegex);
      });
    });

    it('[US-032#3] should have distinct primary colors for each ghost', () => {
      const colors = [
        COLORBLIND_PALETTE.blinky.primary,
        COLORBLIND_PALETTE.pinky.primary,
        COLORBLIND_PALETTE.inky.primary,
        COLORBLIND_PALETTE.clyde.primary,
      ];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    });

    it('should differ from default palette', () => {
      expect(COLORBLIND_PALETTE.blinky.primary).not.toBe(DEFAULT_PALETTE.blinky.primary);
      expect(COLORBLIND_PALETTE.pinky.primary).not.toBe(DEFAULT_PALETTE.pinky.primary);
      expect(COLORBLIND_PALETTE.inky.primary).not.toBe(DEFAULT_PALETTE.inky.primary);
      expect(COLORBLIND_PALETTE.clyde.primary).not.toBe(DEFAULT_PALETTE.clyde.primary);
    });
  });

  describe('[US-032#1] getPalette function', () => {
    it('should return default palette when colorblind mode is false', () => {
      const palette = getPalette(false);
      expect(palette).toEqual(DEFAULT_PALETTE);
    });

    it('should return colorblind palette when colorblind mode is true', () => {
      const palette = getPalette(true);
      expect(palette).toEqual(COLORBLIND_PALETTE);
    });

    it('should return correct palette for each ghost in default mode', () => {
      const palette = getPalette(false);
      expect(palette.blinky).toEqual(DEFAULT_PALETTE.blinky);
      expect(palette.pinky).toEqual(DEFAULT_PALETTE.pinky);
      expect(palette.inky).toEqual(DEFAULT_PALETTE.inky);
      expect(palette.clyde).toEqual(DEFAULT_PALETTE.clyde);
    });

    it('should return correct palette for each ghost in colorblind mode', () => {
      const palette = getPalette(true);
      expect(palette.blinky).toEqual(COLORBLIND_PALETTE.blinky);
      expect(palette.pinky).toEqual(COLORBLIND_PALETTE.pinky);
      expect(palette.inky).toEqual(COLORBLIND_PALETTE.inky);
      expect(palette.clyde).toEqual(COLORBLIND_PALETTE.clyde);
    });
  });
});

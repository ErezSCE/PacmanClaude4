/**
 * Ghost color palettes for default and colorblind-friendly modes.
 * Each ghost has a primary color and an eyes color.
 * Colorblind palette uses colors distinguishable for people with color vision deficiency.
 */

export type GhostPalette = {
  primary: string;
  eyes: string;
};

export type PaletteSet = {
  blinky: GhostPalette;
  pinky: GhostPalette;
  inky: GhostPalette;
  clyde: GhostPalette;
};

/**
 * Default Pac-Man ghost colors (classic arcade palette).
 * - Blinky: Red
 * - Pinky: Pink/Magenta
 * - Inky: Cyan/Light Blue
 * - Clyde: Orange
 */
export const DEFAULT_PALETTE: PaletteSet = {
  blinky: {
    primary: '#FF0000', // Red
    eyes: '#FFFFFF',    // White
  },
  pinky: {
    primary: '#FFB8FF', // Pink/Magenta
    eyes: '#FFFFFF',    // White
  },
  inky: {
    primary: '#00FFFF', // Cyan
    eyes: '#FFFFFF',    // White
  },
  clyde: {
    primary: '#FFAA00', // Orange
    eyes: '#FFFFFF',    // White
  },
};

/**
 * Colorblind-friendly palette optimized for deuteranopia (red-green colorblindness).
 * Uses high-contrast colors that remain distinguishable for most color vision deficiencies.
 * - Blinky: Blue (distinct from others)
 * - Pinky: Yellow (distinct from others)
 * - Inky: Purple/Magenta (distinct from others)
 * - Clyde: Green (distinct from others)
 */
export const COLORBLIND_PALETTE: PaletteSet = {
  blinky: {
    primary: '#0066FF', // Blue
    eyes: '#FFFFFF',    // White
  },
  pinky: {
    primary: '#FFDD00', // Yellow
    eyes: '#000000',    // Black (for better contrast on yellow)
  },
  inky: {
    primary: '#DD00FF', // Purple/Magenta
    eyes: '#FFFFFF',    // White
  },
  clyde: {
    primary: '#00DD00', // Green
    eyes: '#000000',    // Black (for better contrast on green)
  },
};

/**
 * Get the active palette based on colorblind mode preference.
 * @param isColorblindMode - Whether colorblind-friendly palette is enabled
 * @returns The appropriate palette set
 */
export function getPalette(isColorblindMode: boolean): PaletteSet {
  return isColorblindMode ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
}

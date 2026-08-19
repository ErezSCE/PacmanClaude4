/**
 * Browser localStorage utilities for persisting game settings and high scores.
 */

const STORAGE_KEYS = {
  COLORBLIND_MODE: 'pacman_colorblind_mode',
  MUTE_ENABLED: 'pacman_mute_enabled',
  HIGH_SCORES: 'pacman_high_scores',
} as const;

/**
 * Get a value from localStorage.
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The stored value or default value
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to retrieve item from storage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage.
 * @param key - The storage key
 * @param value - The value to store
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to set item in storage: ${key}`, error);
  }
}

/**
 * Get the colorblind mode preference from storage.
 * @returns Whether colorblind-friendly palette is enabled
 */
export function getColorblindMode(): boolean {
  return getItem(STORAGE_KEYS.COLORBLIND_MODE, false);
}

/**
 * Set the colorblind mode preference in storage.
 * @param enabled - Whether to enable colorblind-friendly palette
 */
export function setColorblindMode(enabled: boolean): void {
  setItem(STORAGE_KEYS.COLORBLIND_MODE, enabled);
}

/**
 * Get the mute preference from storage.
 * @returns Whether audio is muted
 */
export function getMuteEnabled(): boolean {
  return getItem(STORAGE_KEYS.MUTE_ENABLED, false);
}

/**
 * Set the mute preference in storage.
 * @param enabled - Whether audio should be muted
 */
export function setMuteEnabled(enabled: boolean): void {
  setItem(STORAGE_KEYS.MUTE_ENABLED, enabled);
}

/**
 * Score & High Score Service.
 *
 * Aggregates score contributions from every point source (dots, pellets,
 * ghosts via combo, and fruit) into a single running total exposed via
 * {@link ScoreService}, and persists/retrieves the top-10 high score list
 * to/from browser localStorage.
 */

import { getItem, setItem } from './storage';
import type { HighScoreEntry } from '../types';

/** Points awarded for eating a single regular dot. */
export const DOT_POINTS = 10;

/** Points awarded for eating a power pellet. */
export const PELLET_POINTS = 50;

/**
 * Escalating ghost-eat combo point values. The combo index resets to 0
 * whenever a new power pellet is eaten (a fresh scared window begins) and
 * increments by one for every ghost eaten during that window, capping at
 * the final table entry for any additional ghosts eaten in the same combo.
 */
export const GHOST_COMBO_POINTS: readonly number[] = [200, 400, 800, 1600];

/** Maximum number of entries retained in the persisted high score list. */
const MAX_HIGH_SCORES = 10;

/** localStorage key used to persist the high score list. */
const HIGH_SCORES_STORAGE_KEY = 'pacman_high_scores';

/** Listener callback invoked with the new running total whenever it changes. */
export type ScoreListener = (score: number) => void;

/** Listener callback invoked when an extra life is awarded. */
export type ExtraLifeListener = () => void;

/** Score threshold at which an extra life is awarded (10,000 points). */
export const EXTRA_LIFE_THRESHOLD = 10000;

/**
 * Returns the point value for the ghost-eat combo at the given zero-based
 * index, clamping to the highest configured value once the combo exceeds
 * the table (matches the classic 200/400/800/1600 escalation, holding at
 * 1600 for any further ghosts eaten in the same scared window).
 *
 * @param comboIndex - Zero-based count of ghosts eaten during the current
 *   scared window (0 = first ghost eaten).
 * @returns The point value awarded for eating that ghost.
 */
export function getGhostComboPoints(comboIndex: number): number {
  const cappedIndex = Math.min(Math.max(comboIndex, 0), GHOST_COMBO_POINTS.length - 1);
  return GHOST_COMBO_POINTS[cappedIndex];
}

/**
 * Aggregates score contributions from every point source (dots, pellets,
 * ghosts, fruit) into a single running total, exposing subscribe/unsubscribe
 * so UI-facing state (HUD) can react to score changes synchronously, within
 * the same frame the underlying event occurs.
 */
export class ScoreService {
  private total = 0;
  private ghostComboIndex = 0;
  private readonly listeners: Set<ScoreListener> = new Set();
  private readonly extraLifeListeners: Set<ExtraLifeListener> = new Set();
  private extraLifeThresholdCrossed = false;

  /** Returns the current running score total. */
  getScore(): number {
    return this.total;
  }

  /** Adds points for eating a regular dot (10 pts) and notifies listeners. */
  addDot(): number {
    return this.applyPoints(DOT_POINTS);
  }

  /**
   * Adds points for eating a power pellet (50 pts) and resets the ghost-eat
   * combo for the new scared window that begins.
   */
  addPellet(): number {
    this.ghostComboIndex = 0;
    return this.applyPoints(PELLET_POINTS);
  }

  /**
   * Adds combo-based points for eating a ghost. Each successive ghost eaten
   * during the same scared window awards more points (200/400/800/1600),
   * capping at the final tier for any further ghosts in that window.
   *
   * @returns The points awarded for this specific ghost.
   */
  addGhost(): number {
    const points = getGhostComboPoints(this.ghostComboIndex);
    this.ghostComboIndex += 1;
    this.applyPoints(points);
    return points;
  }

  /**
   * Adds points for eating a bonus fruit.
   *
   * @param points - The level-specific fruit point value (see FruitManager).
   */
  addFruit(points: number): number {
    return this.applyPoints(points);
  }

  /** Resets the ghost-eat combo counter (e.g. once scared mode ends). */
  resetGhostCombo(): void {
    this.ghostComboIndex = 0;
  }

  /** Resets the running score total and combo state, e.g. for a new game. */
  reset(): void {
    this.total = 0;
    this.ghostComboIndex = 0;
    this.extraLifeThresholdCrossed = false;
    this.notify();
  }

  /**
   * Subscribes to score changes.
   *
   * @param listener - Called synchronously with the new total whenever the
   *   score changes.
   * @returns An unsubscribe function.
   */
  subscribe(listener: ScoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribes to extra-life awards.
   *
   * @param listener - Called synchronously when the score crosses the 10,000
   *   point threshold (exactly once per game).
   * @returns An unsubscribe function.
   */
  subscribeToExtraLife(listener: ExtraLifeListener): () => void {
    this.extraLifeListeners.add(listener);
    return () => {
      this.extraLifeListeners.delete(listener);
    };
  }

  private applyPoints(points: number): number {
    const previousTotal = this.total;
    this.total += points;

    // Check if we've crossed the 10,000-point threshold for the first time
    if (
      !this.extraLifeThresholdCrossed &&
      previousTotal < EXTRA_LIFE_THRESHOLD &&
      this.total >= EXTRA_LIFE_THRESHOLD
    ) {
      this.extraLifeThresholdCrossed = true;
      this.notifyExtraLife();
    }

    this.notify();
    return this.total;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.total);
    }
  }

  private notifyExtraLife(): void {
    for (const listener of this.extraLifeListeners) {
      listener();
    }
  }
}

/**
 * Loads the persisted top-10 high score list from localStorage, sorted
 * descending by score.
 */
export function loadHighScores(): HighScoreEntry[] {
  const scores = getItem<HighScoreEntry[]>(HIGH_SCORES_STORAGE_KEY, []);
  return [...scores].sort((a, b) => b.score - a.score);
}

/**
 * Determines whether a given score would qualify for the persisted top-10
 * high score list.
 *
 * @param score - The candidate score.
 * @returns Whether the score would be added to the list.
 */
export function isHighScore(score: number): boolean {
  const scores = loadHighScores();
  if (scores.length < MAX_HIGH_SCORES) {
    return true;
  }
  const lowestScore = scores[scores.length - 1].score;
  return score > lowestScore;
}

/**
 * Saves a new high score entry, inserting it into the persisted top-10
 * list (sorted descending, truncated to 10 entries).
 *
 * @param initials - The player's 3-letter initials.
 * @param score - The final score achieved.
 * @returns The updated top-10 high score list.
 */
export function saveHighScore(initials: string, score: number): HighScoreEntry[] {
  const scores = loadHighScores();
  const newEntry: HighScoreEntry = {
    id: generateId(),
    initials: initials.toUpperCase().slice(0, 3),
    score,
    achievedAt: new Date().toISOString(),
  };
  const updated = [...scores, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGH_SCORES);
  setItem(HIGH_SCORES_STORAGE_KEY, updated);
  return updated;
}

/** Generates a reasonably unique id for a new high score entry. */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

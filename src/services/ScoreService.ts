import { HighScoreEntry } from '../types';
import { getItem, setItem } from './storage';

const HIGH_SCORES_KEY = 'high_scores';
const MAX_HIGH_SCORES = 10;

/** Load the top-10 high scores from localStorage. */
export function loadHighScores(): HighScoreEntry[] {
  return getItem<HighScoreEntry[]>(HIGH_SCORES_KEY) ?? [];
}

/** Save a new high score entry, keeping only the top 10. */
export function saveHighScore(entry: HighScoreEntry): void {
  const scores = loadHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, MAX_HIGH_SCORES);
  setItem(HIGH_SCORES_KEY, top);
}

/** Check whether a score qualifies for the high score list. */
export function isHighScore(score: number): boolean {
  const scores = loadHighScores();
  if (scores.length < MAX_HIGH_SCORES) return true;
  return score > scores[scores.length - 1].score;
}

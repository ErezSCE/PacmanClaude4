import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  DOT_POINTS,
  PELLET_POINTS,
  GHOST_COMBO_POINTS,
  ScoreService,
  getGhostComboPoints,
  loadHighScores,
  saveHighScore,
  isHighScore,
} from './ScoreService';

describe('ScoreService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('[US-015#1] eating dots', () => {
    it('adds 10 points to the score for a single dot', () => {
      const service = new ScoreService();

      service.addDot();

      expect(service.getScore()).toBe(DOT_POINTS);
      expect(service.getScore()).toBe(10);
    });

    it('accumulates score across a sequence of dots', () => {
      const service = new ScoreService();

      service.addDot();
      service.addDot();
      service.addDot();

      expect(service.getScore()).toBe(30);
    });
  });

  describe('[US-015#2] eating power pellets', () => {
    it('adds 50 points to the score for a single power pellet', () => {
      const service = new ScoreService();

      service.addPellet();

      expect(service.getScore()).toBe(PELLET_POINTS);
      expect(service.getScore()).toBe(50);
    });

    it('accumulates score across dots and pellets together', () => {
      const service = new ScoreService();

      service.addDot();
      service.addPellet();
      service.addDot();

      expect(service.getScore()).toBe(10 + 50 + 10);
    });
  });

  describe('[US-015#3] score updates are reflected synchronously (same frame)', () => {
    it('notifies subscribers immediately with the new total when a dot is eaten', () => {
      const service = new ScoreService();
      const observedScores: number[] = [];
      service.subscribe((score) => observedScores.push(score));

      service.addDot();

      expect(observedScores).toEqual([10]);
    });

    it('notifies subscribers immediately with the new total for every point source', () => {
      const service = new ScoreService();
      const observedScores: number[] = [];
      service.subscribe((score) => observedScores.push(score));

      service.addDot();
      service.addPellet();
      service.addGhost();
      service.addFruit(100);

      expect(observedScores).toEqual([10, 60, 260, 360]);
      expect(service.getScore()).toBe(360);
    });

    it('stops notifying a listener after it unsubscribes', () => {
      const service = new ScoreService();
      const observedScores: number[] = [];
      const unsubscribe = service.subscribe((score) => observedScores.push(score));

      service.addDot();
      unsubscribe();
      service.addDot();

      expect(observedScores).toEqual([10]);
    });
  });

  describe('ghost-eat combo scoring', () => {
    it('awards the classic 200/400/800/1600 escalating combo within one scared window', () => {
      const service = new ScoreService();

      const first = service.addGhost();
      const second = service.addGhost();
      const third = service.addGhost();
      const fourth = service.addGhost();

      expect([first, second, third, fourth]).toEqual([200, 400, 800, 1600]);
      expect(service.getScore()).toBe(200 + 400 + 800 + 1600);
    });

    it('caps combo points at 1600 for any further ghosts in the same window', () => {
      expect(getGhostComboPoints(4)).toBe(1600);
      expect(getGhostComboPoints(99)).toBe(1600);
    });

    it('resets the ghost combo when a new power pellet is eaten', () => {
      const service = new ScoreService();

      service.addGhost();
      service.addGhost();
      service.addPellet();
      const afterReset = service.addGhost();

      expect(afterReset).toBe(GHOST_COMBO_POINTS[0]);
    });

    it('resets the ghost combo via resetGhostCombo', () => {
      const service = new ScoreService();

      service.addGhost();
      service.resetGhostCombo();
      const afterReset = service.addGhost();

      expect(afterReset).toBe(200);
    });
  });

  describe('fruit scoring', () => {
    it('adds level-specific fruit points to the running total', () => {
      const service = new ScoreService();

      service.addFruit(300);

      expect(service.getScore()).toBe(300);
    });
  });

  describe('aggregating all point sources', () => {
    it('accumulates a running total across dots, pellets, ghosts, and fruit', () => {
      const service = new ScoreService();

      service.addDot(); // 10
      service.addDot(); // 20
      service.addPellet(); // 70
      service.addGhost(); // +200 = 270
      service.addGhost(); // +400 = 670
      service.addFruit(100); // 770
      service.addDot(); // 780

      expect(service.getScore()).toBe(780);
    });
  });

  describe('reset', () => {
    it('resets the running total and combo state to zero', () => {
      const service = new ScoreService();
      service.addDot();
      service.addGhost();

      service.reset();

      expect(service.getScore()).toBe(0);
      expect(service.addGhost()).toBe(200);
    });
  });

  describe('high score persistence', () => {
    it('reports a score as a high score when the list has fewer than 10 entries', () => {
      expect(isHighScore(50)).toBe(true);
    });

    it('saves and loads a high score entry sorted descending by score', () => {
      saveHighScore('AAA', 500);
      saveHighScore('BBB', 1000);

      const scores = loadHighScores();

      expect(scores).toHaveLength(2);
      expect(scores[0].score).toBe(1000);
      expect(scores[0].initials).toBe('BBB');
      expect(scores[1].score).toBe(500);
    });

    it('truncates the high score list to the top 10 entries', () => {
      for (let i = 0; i < 12; i += 1) {
        saveHighScore('AAA', i * 100);
      }

      const scores = loadHighScores();

      expect(scores).toHaveLength(10);
      expect(scores[0].score).toBe(1100);
    });
  });
});

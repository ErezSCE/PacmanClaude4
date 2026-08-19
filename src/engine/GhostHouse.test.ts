import { describe, it, expect, beforeEach } from 'vitest';
import { GhostHouse } from './GhostHouse';
import { Ghost } from './entities/Ghost';
import type { GhostReleaseConfig } from './GhostHouse';

function makeGhosts(): Ghost[] {
  return [
    new Ghost('blinky', { x: 13, y: 11 }, { x: 25, y: 0 }),
    new Ghost('pinky', { x: 14, y: 11 }, { x: 2, y: 0 }),
    new Ghost('inky', { x: 13, y: 14 }, { x: 27, y: 31 }),
    new Ghost('clyde', { x: 14, y: 14 }, { x: 0, y: 31 }),
  ];
}

describe('GhostHouse staggered ghost release', () => {
  it('[US-008#1] only Blinky is released immediately at level/life start', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(false);
    expect(house.isReleased('inky')).toBe(false);
    expect(house.isReleased('clyde')).toBe(false);
  });

  it('[US-008#2] Pinky releases after its configured delay', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // Before delay elapses
    house.tick(99);
    expect(house.isReleased('pinky')).toBe(false);

    // After delay elapses
    house.tick(1);
    expect(house.isReleased('pinky')).toBe(true);
  });

  it('[US-008#2] Inky releases after its configured delay', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // Before delay elapses
    house.tick(199);
    expect(house.isReleased('inky')).toBe(false);

    // After delay elapses
    house.tick(1);
    expect(house.isReleased('inky')).toBe(true);
  });

  it('[US-008#2] Clyde releases after its configured delay', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // Before delay elapses
    house.tick(299);
    expect(house.isReleased('clyde')).toBe(false);

    // After delay elapses
    house.tick(1);
    expect(house.isReleased('clyde')).toBe(true);
  });

  it('[US-008#2] ghosts release in deterministic order: Blinky -> Pinky -> Inky -> Clyde', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // At start: only Blinky
    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(false);
    expect(house.isReleased('inky')).toBe(false);
    expect(house.isReleased('clyde')).toBe(false);

    // After 100ms: Pinky joins
    house.tick(100);
    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(true);
    expect(house.isReleased('inky')).toBe(false);
    expect(house.isReleased('clyde')).toBe(false);

    // After 200ms: Inky joins
    house.tick(100);
    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(true);
    expect(house.isReleased('inky')).toBe(true);
    expect(house.isReleased('clyde')).toBe(false);

    // After 300ms: Clyde joins
    house.tick(100);
    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(true);
    expect(house.isReleased('inky')).toBe(true);
    expect(house.isReleased('clyde')).toBe(true);
  });

  it('[US-008#3] release order and delays are reproducible given the same level/config', () => {
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };

    // First instance
    const ghosts1 = makeGhosts();
    const house1 = new GhostHouse(ghosts1, releaseConfig);
    house1.tick(150);
    const state1 = {
      blinky: house1.isReleased('blinky'),
      pinky: house1.isReleased('pinky'),
      inky: house1.isReleased('inky'),
      clyde: house1.isReleased('clyde'),
    };

    // Second instance with same config
    const ghosts2 = makeGhosts();
    const house2 = new GhostHouse(ghosts2, releaseConfig);
    house2.tick(150);
    const state2 = {
      blinky: house2.isReleased('blinky'),
      pinky: house2.isReleased('pinky'),
      inky: house2.isReleased('inky'),
      clyde: house2.isReleased('clyde'),
    };

    expect(state1).toEqual(state2);
  });

  it('[US-008#1] handles large tick values that cross multiple release boundaries', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // Single large tick that crosses all boundaries
    house.tick(350);

    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(true);
    expect(house.isReleased('inky')).toBe(true);
    expect(house.isReleased('clyde')).toBe(true);
  });

  it('[US-008#2] respects custom release delays from level config', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 50,
      inky: 150,
      clyde: 250,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    house.tick(50);
    expect(house.isReleased('pinky')).toBe(true);
    expect(house.isReleased('inky')).toBe(false);

    house.tick(100);
    expect(house.isReleased('inky')).toBe(true);
    expect(house.isReleased('clyde')).toBe(false);

    house.tick(100);
    expect(house.isReleased('clyde')).toBe(true);
  });

  it('[US-008#1] reset() reinitializes release state for a new level/life', () => {
    const ghosts = makeGhosts();
    const releaseConfig: GhostReleaseConfig = {
      blinky: 0,
      pinky: 100,
      inky: 200,
      clyde: 300,
    };
    const house = new GhostHouse(ghosts, releaseConfig);

    // Release all ghosts
    house.tick(350);
    expect(house.isReleased('clyde')).toBe(true);

    // Reset for new level
    house.reset();

    // Only Blinky should be released again
    expect(house.isReleased('blinky')).toBe(true);
    expect(house.isReleased('pinky')).toBe(false);
    expect(house.isReleased('inky')).toBe(false);
    expect(house.isReleased('clyde')).toBe(false);
  });
});

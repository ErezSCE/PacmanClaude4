import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { InputManager, useInput } from './InputManager';
import type { Direction } from '../types';

function keydown(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true });
}

function keyup(key: string): KeyboardEvent {
  return new KeyboardEvent('keyup', { key, cancelable: true });
}

describe('InputManager', () => {
  describe('[US-003#1] arrow key normalization', () => {
    it.each([
      ['ArrowUp', 'up'],
      ['ArrowDown', 'down'],
      ['ArrowLeft', 'left'],
      ['ArrowRight', 'right'],
    ])('maps %s to desired direction "%s"', (key, expected) => {
      const manager = new InputManager();
      manager.simulateKeyDown({ key, preventDefault: () => {} });
      expect(manager.getDirection()).toBe(expected as Direction);
    });
  });

  describe('[US-003#2] WASD normalization', () => {
    it.each([
      ['w', 'up'],
      ['W', 'up'],
      ['s', 'down'],
      ['S', 'down'],
      ['a', 'left'],
      ['A', 'left'],
      ['d', 'right'],
      ['D', 'right'],
    ])('maps %s to desired direction "%s"', (key, expected) => {
      const manager = new InputManager();
      manager.simulateKeyDown({ key, preventDefault: () => {} });
      expect(manager.getDirection()).toBe(expected as Direction);
    });

    it('produces the same result as the corresponding arrow key for every mapping', () => {
      const pairs: Array<[string, string]> = [
        ['w', 'ArrowUp'],
        ['a', 'ArrowLeft'],
        ['s', 'ArrowDown'],
        ['d', 'ArrowRight'],
      ];

      pairs.forEach(([wasdKey, arrowKey]) => {
        const wasdManager = new InputManager();
        const arrowManager = new InputManager();
        wasdManager.simulateKeyDown({ key: wasdKey, preventDefault: () => {} });
        arrowManager.simulateKeyDown({ key: arrowKey, preventDefault: () => {} });
        expect(wasdManager.getDirection()).toBe(arrowManager.getDirection());
      });
    });
  });

  describe('[US-003#3] rapid alternating key presses', () => {
    it('updates the desired direction for every key in a fast sequence without dropping any', () => {
      const received: Direction[] = [];
      const manager = new InputManager({ onDirectionChange: (dir) => received.push(dir) });
      const sequence = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'd', 's', 'a'];
      const expected: Direction[] = ['up', 'right', 'down', 'left', 'up', 'right', 'down', 'left'];

      sequence.forEach((key) => manager.simulateKeyDown({ key, preventDefault: () => {} }));

      expect(received).toEqual(expected);
      expect(manager.getDirection()).toBe('left');
    });

    it('handles diagonal-style overlapping presses (second key wins before the first is released)', () => {
      const manager = new InputManager();

      manager.simulateKeyDown({ key: 'ArrowUp', preventDefault: () => {} });
      expect(manager.getDirection()).toBe('up');

      // ArrowRight pressed while ArrowUp is still logically held (no keyup yet)
      manager.simulateKeyDown({ key: 'ArrowRight', preventDefault: () => {} });
      expect(manager.getDirection()).toBe('right');

      // A third overlapping key (down) immediately supersedes it
      manager.simulateKeyDown({ key: 's', preventDefault: () => {} });
      expect(manager.getDirection()).toBe('down');
    });
  });

  describe('key release behavior', () => {
    it('retains the last desired direction after the key is released (keyup is a no-op)', () => {
      const manager = new InputManager();
      const target = new EventTarget();
      const detach = manager.attach(target);

      target.dispatchEvent(keydown('ArrowLeft'));
      expect(manager.getDirection()).toBe('left');

      target.dispatchEvent(keyup('ArrowLeft'));
      expect(manager.getDirection()).toBe('left');

      detach();
    });

    it('continues to accept new direction presses after a previous key is released', () => {
      const manager = new InputManager();
      const target = new EventTarget();
      manager.attach(target);

      target.dispatchEvent(keydown('ArrowUp'));
      target.dispatchEvent(keyup('ArrowUp'));
      target.dispatchEvent(keydown('ArrowDown'));

      expect(manager.getDirection()).toBe('down');
    });

    it('stops reacting to key events once detached', () => {
      const manager = new InputManager();
      const target = new EventTarget();
      const detach = manager.attach(target);
      detach();

      target.dispatchEvent(keydown('ArrowUp'));
      expect(manager.getDirection()).toBe('none');
    });
  });

  describe('pause and mute key bindings', () => {
    it('invokes onTogglePause for Escape and P', () => {
      const onTogglePause = vi.fn();
      const manager = new InputManager({ onTogglePause });
      manager.simulateKeyDown({ key: 'Escape', preventDefault: () => {} });
      manager.simulateKeyDown({ key: 'p', preventDefault: () => {} });
      expect(onTogglePause).toHaveBeenCalledTimes(2);
    });

    it('invokes onToggleMute for M', () => {
      const onToggleMute = vi.fn();
      const manager = new InputManager({ onToggleMute });
      manager.simulateKeyDown({ key: 'm', preventDefault: () => {} });
      expect(onToggleMute).toHaveBeenCalledTimes(1);
    });

    it('ignores unmapped keys without throwing or changing direction', () => {
      const manager = new InputManager();
      expect(() =>
        manager.simulateKeyDown({ key: 'Enter', preventDefault: () => {} })
      ).not.toThrow();
      expect(manager.getDirection()).toBe('none');
    });
  });
});

function touchEvent(
  type: string,
  touches: Array<{ clientX: number; clientY: number }>,
  changedTouches: Array<{ clientX: number; clientY: number }> = touches
): Event {
  const event = new Event(type, { cancelable: true, bubbles: true });
  Object.assign(event, { touches, changedTouches });
  return event;
}

describe('InputManager swipe gestures', () => {
  describe('[US-004#1] swipe gesture normalization', () => {
    it.each([
      ['right', 50, 0],
      ['left', -60, 0],
      ['down', 0, 40],
      ['up', 0, -40],
    ])('normalizes a %s swipe into the desired direction', (expected, dx, dy) => {
      const times = [0, 50];
      let call = 0;
      const manager = new InputManager({}, { now: () => times[call++] });

      manager.simulateTouchStart({ touches: [{ clientX: 100, clientY: 100 }] });
      manager.simulateTouchEnd({
        touches: [],
        changedTouches: [{ clientX: 100 + dx, clientY: 100 + dy }],
      });

      expect(manager.getDirection()).toBe(expected as Direction);
    });

    it('treats a diagonal swipe as whichever axis moved the furthest', () => {
      const times = [0, 50];
      let call = 0;
      const manager = new InputManager({}, { now: () => times[call++] });

      manager.simulateTouchStart({ touches: [{ clientX: 0, clientY: 0 }] });
      manager.simulateTouchEnd({ touches: [], changedTouches: [{ clientX: 80, clientY: 10 }] });

      expect(manager.getDirection()).toBe('right');
    });
  });

  describe('[US-004#2] accidental-tap and slow-drag rejection', () => {
    it('ignores a short swipe below the minimum distance threshold', () => {
      const times = [0, 50];
      let call = 0;
      const manager = new InputManager({}, { now: () => times[call++] });

      manager.simulateTouchStart({ touches: [{ clientX: 100, clientY: 100 }] });
      manager.simulateTouchEnd({ touches: [], changedTouches: [{ clientX: 108, clientY: 100 }] });

      expect(manager.getDirection()).toBe('none');
    });

    it('ignores a slow drag that covers distance but not enough velocity', () => {
      const times = [0, 1000];
      let call = 0;
      const manager = new InputManager({}, { now: () => times[call++] });

      manager.simulateTouchStart({ touches: [{ clientX: 100, clientY: 100 }] });
      manager.simulateTouchEnd({ touches: [], changedTouches: [{ clientX: 150, clientY: 100 }] });

      expect(manager.getDirection()).toBe('none');
    });

    it('ignores a touch gesture with no matching touch point', () => {
      const manager = new InputManager();
      expect(() =>
        manager.simulateTouchEnd({ touches: [], changedTouches: [] })
      ).not.toThrow();
      expect(manager.getDirection()).toBe('none');
    });
  });

  describe('[US-004#3] swipe input shares the same InputManager API as keyboard input', () => {
    it('invokes onDirectionChange with the normalized direction for a swipe, same as a key press', () => {
      const received: Direction[] = [];
      const times = [0, 100];
      let call = 0;
      const manager = new InputManager(
        { onDirectionChange: (dir) => received.push(dir) },
        { now: () => times[call++] }
      );

      manager.simulateTouchStart({ touches: [{ clientX: 0, clientY: 0 }] });
      manager.simulateTouchEnd({ touches: [], changedTouches: [{ clientX: 0, clientY: 60 }] });

      expect(received).toEqual(['down']);
      expect(manager.getDirection()).toBe('down');
    });

    it('normalizes swipes dispatched as real touchstart/touchend events through attach()', () => {
      const manager = new InputManager();
      const target = new EventTarget();
      const detach = manager.attach(target);

      target.dispatchEvent(touchEvent('touchstart', [{ clientX: 200, clientY: 200 }]));
      target.dispatchEvent(touchEvent('touchend', [], [{ clientX: 260, clientY: 200 }]));

      expect(manager.getDirection()).toBe('right');
      detach();
    });

    it('stops reacting to touch gestures once detached, just like keyboard events', () => {
      const manager = new InputManager();
      const target = new EventTarget();
      const detach = manager.attach(target);
      detach();

      target.dispatchEvent(touchEvent('touchstart', [{ clientX: 0, clientY: 0 }]));
      target.dispatchEvent(touchEvent('touchend', [], [{ clientX: 100, clientY: 0 }]));

      expect(manager.getDirection()).toBe('none');
    });
  });
});

describe('useInput', () => {
  it('[US-003#1] exposes the desired direction to consuming components after an arrow key press', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(keydown('ArrowRight'));
    });

    expect(result.current.direction).toBe('right');
  });

  it('[US-003#2] exposes the same direction for a WASD key as for the corresponding arrow key', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(keydown('d'));
    });

    expect(result.current.direction).toBe('right');
  });

  it('[US-003#3] re-renders with each new direction across a rapid alternating sequence', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(keydown('ArrowUp'));
    });
    expect(result.current.direction).toBe('up');

    act(() => {
      window.dispatchEvent(keydown('ArrowLeft'));
    });
    expect(result.current.direction).toBe('left');

    act(() => {
      window.dispatchEvent(keydown('ArrowDown'));
    });
    expect(result.current.direction).toBe('down');

    act(() => {
      window.dispatchEvent(keydown('d'));
    });
    expect(result.current.direction).toBe('right');
  });

  it('[US-004#1] exposes the desired direction to consuming components after a swipe gesture', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(touchEvent('touchstart', [{ clientX: 50, clientY: 50 }]));
      window.dispatchEvent(touchEvent('touchend', [], [{ clientX: 50, clientY: 120 }]));
    });

    expect(result.current.direction).toBe('down');
  });

  it('[US-004#3] ignores tiny touch movements so an accidental tap does not change direction', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(touchEvent('touchstart', [{ clientX: 50, clientY: 50 }]));
      window.dispatchEvent(touchEvent('touchend', [], [{ clientX: 52, clientY: 51 }]));
    });

    expect(result.current.direction).toBe('none');
  });

  it('detaches the keyboard listener on unmount so later key events are ignored', () => {
    const { result, unmount } = renderHook(() => useInput());
    unmount();

    act(() => {
      window.dispatchEvent(keydown('ArrowUp'));
    });

    expect(result.current.direction).toBe('none');
  });
});

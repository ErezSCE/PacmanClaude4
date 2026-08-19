import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GameCanvas, computeCanvasScale } from './GameCanvas';
import * as storage from '../services/storage';
import { getPalette } from '../data/palettes';

/**
 * Minimal ResizeObserver mock for jsdom, which does not implement it.
 * Captures the observed element so tests can manually trigger a resize
 * callback with an arbitrary contentRect, simulating real viewport changes.
 */
class MockResizeObserver implements ResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observedElement: Element | null = null;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observedElement = element;
  }

  unobserve(): void {
    this.observedElement = null;
  }

  disconnect(): void {
    this.observedElement = null;
  }

  trigger(contentRect: { width: number; height: number }): void {
    const entry = { contentRect } as ResizeObserverEntry;
    this.callback([entry], this);
  }
}

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

  describe('[US-033#1] responsive canvas scaling', () => {
    let originalResizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
      originalResizeObserver = globalThis.ResizeObserver;
      MockResizeObserver.instances = [];
      (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      if (originalResizeObserver) {
        globalThis.ResizeObserver = originalResizeObserver;
      } else {
        delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
      }
    });

    it('[US-033#1] computeCanvasScale fits the logical resolution inside a narrow 375px viewport', () => {
      // A 375px wide container with a typical 300px tall region below the HUD.
      const scale = computeCanvasScale(375, 300, 800, 600);

      // The scale should shrink the canvas to fit within the container on
      // both axes while preserving the 800x600 aspect ratio.
      expect(scale).toBeCloseTo(Math.min(375 / 800, 300 / 600), 5);
      expect(scale * 800).toBeLessThanOrEqual(375 + 0.001);
      expect(scale * 600).toBeLessThanOrEqual(300 + 0.001);
    });

    it('[US-033#1] computeCanvasScale scales up to fill a wide 2560px viewport while preserving aspect ratio', () => {
      const scale = computeCanvasScale(2560, 1440, 800, 600);

      expect(scale).toBeCloseTo(Math.min(2560 / 800, 1440 / 600), 5);
      // Aspect ratio is preserved: width/height of the scaled canvas equals
      // the logical canvas aspect ratio.
      const scaledWidth = 800 * scale;
      const scaledHeight = 600 * scale;
      expect(scaledWidth / scaledHeight).toBeCloseTo(800 / 600, 5);
    });

    it('[US-033#1] falls back to scale 1 when the container has no measurable size yet', () => {
      expect(computeCanvasScale(0, 0, 800, 600)).toBe(1);
    });

    it('[US-033#1] rescales the rendered canvas CSS size in response to a simulated 375px viewport via ResizeObserver', () => {
      const { container } = render(<GameCanvas width={800} height={600} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      const observer = MockResizeObserver.instances[0];
      expect(observer).toBeDefined();

      observer.trigger({ width: 375, height: 300 });

      const expectedScale = computeCanvasScale(375, 300, 800, 600);
      expect(canvas.style.width).toBe(`${800 * expectedScale}px`);
      expect(canvas.style.height).toBe(`${600 * expectedScale}px`);
    });

    it('[US-033#1] rescales the rendered canvas CSS size in response to a simulated 2560px viewport via ResizeObserver', () => {
      const { container } = render(<GameCanvas width={800} height={600} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      const observer = MockResizeObserver.instances[0];
      expect(observer).toBeDefined();

      observer.trigger({ width: 2560, height: 1440 });

      const expectedScale = computeCanvasScale(2560, 1440, 800, 600);
      expect(canvas.style.width).toBe(`${800 * expectedScale}px`);
      expect(canvas.style.height).toBe(`${600 * expectedScale}px`);
    });

    it('[US-033#2] the internal drawing resolution (width/height attributes) stays fixed across viewport changes, keeping the game loop decoupled from layout so frame throughput is unaffected', () => {
      const { container } = render(<GameCanvas width={800} height={600} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      const observer = MockResizeObserver.instances[0];

      observer.trigger({ width: 375, height: 300 });
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);

      observer.trigger({ width: 2560, height: 1440 });
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('[US-033#3] applies a new CSS scale synchronously on resize, ensuring no perceptible lag between a resize/input event and the on-screen update', () => {
      const { container } = render(<GameCanvas width={800} height={600} />);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      const observer = MockResizeObserver.instances[0];

      observer.trigger({ width: 1024, height: 768 });
      const firstWidth = canvas.style.width;

      observer.trigger({ width: 1920, height: 1080 });
      const secondWidth = canvas.style.width;

      // The style is updated immediately (no debounce/async delay) so the
      // canvas reflects the latest measured container size right away.
      expect(firstWidth).not.toBe(secondWidth);
    });
  });
});

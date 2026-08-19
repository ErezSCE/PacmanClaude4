import { describe, it, expect } from 'vitest';
import { registerServiceWorker } from './registerServiceWorker';

describe('registerServiceWorker (stub)', () => {
  it('is exported as a callable placeholder pending the PWA feature implementation', () => {
    expect(typeof registerServiceWorker).toBe('function');
    expect(() => registerServiceWorker()).toThrow('not implemented');
  });
});

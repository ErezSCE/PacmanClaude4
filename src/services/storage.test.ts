import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getItem,
  setItem,
  getColorblindMode,
  setColorblindMode,
  getMuteEnabled,
  setMuteEnabled,
} from './storage';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('[US-032#2] getItem and setItem', () => {
    it('should store and retrieve a string value', () => {
      setItem('test_key', 'test_value');
      const result = getItem('test_key', 'default');
      expect(result).toBe('test_value');
    });

    it('should store and retrieve a number value', () => {
      setItem('test_number', 42);
      const result = getItem('test_number', 0);
      expect(result).toBe(42);
    });

    it('should store and retrieve a boolean value', () => {
      setItem('test_bool', true);
      const result = getItem('test_bool', false);
      expect(result).toBe(true);
    });

    it('should store and retrieve an object value', () => {
      const testObj = { name: 'test', value: 123 };
      setItem('test_obj', testObj);
      const result = getItem('test_obj', {});
      expect(result).toEqual(testObj);
    });

    it('should return default value when key does not exist', () => {
      const result = getItem('nonexistent_key', 'default_value');
      expect(result).toBe('default_value');
    });

    it('should handle JSON serialization errors gracefully', () => {
      localStorage.setItem('bad_json', '{invalid json}');
      const result = getItem('bad_json', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('[US-032#2] getColorblindMode and setColorblindMode', () => {
    it('should return false by default', () => {
      const result = getColorblindMode();
      expect(result).toBe(false);
    });

    it('should store and retrieve colorblind mode as true', () => {
      setColorblindMode(true);
      const result = getColorblindMode();
      expect(result).toBe(true);
    });

    it('should store and retrieve colorblind mode as false', () => {
      setColorblindMode(true);
      setColorblindMode(false);
      const result = getColorblindMode();
      expect(result).toBe(false);
    });

    it('should persist colorblind mode across multiple calls', () => {
      setColorblindMode(true);
      expect(getColorblindMode()).toBe(true);
      expect(getColorblindMode()).toBe(true);
    });

    it('should toggle colorblind mode correctly', () => {
      setColorblindMode(true);
      expect(getColorblindMode()).toBe(true);
      setColorblindMode(false);
      expect(getColorblindMode()).toBe(false);
      setColorblindMode(true);
      expect(getColorblindMode()).toBe(true);
    });
  });

  describe('[US-032#2] getMuteEnabled and setMuteEnabled', () => {
    it('should return false by default', () => {
      const result = getMuteEnabled();
      expect(result).toBe(false);
    });

    it('should store and retrieve mute enabled as true', () => {
      setMuteEnabled(true);
      const result = getMuteEnabled();
      expect(result).toBe(true);
    });

    it('should store and retrieve mute enabled as false', () => {
      setMuteEnabled(true);
      setMuteEnabled(false);
      const result = getMuteEnabled();
      expect(result).toBe(false);
    });

    it('should persist mute setting across multiple calls', () => {
      setMuteEnabled(true);
      expect(getMuteEnabled()).toBe(true);
      expect(getMuteEnabled()).toBe(true);
    });
  });

  describe('Storage independence', () => {
    it('should not interfere with other storage keys', () => {
      setColorblindMode(true);
      setMuteEnabled(true);
      setItem('custom_key', 'custom_value');

      expect(getColorblindMode()).toBe(true);
      expect(getMuteEnabled()).toBe(true);
      expect(getItem('custom_key', '')).toBe('custom_value');
    });
  });
});

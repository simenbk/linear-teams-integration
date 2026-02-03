import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateId,
  nowISO,
  sleep,
  calculateBackoffDelay,
  isDefined,
  assertDefined,
  safeJsonParse,
  ok,
  err,
} from '../utils.js';

describe('generateId', () => {
  it('should generate a valid UUID', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('nowISO', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return current ISO timestamp', () => {
    const now = new Date('2024-01-15T10:30:00.000Z');
    vi.setSystemTime(now);

    expect(nowISO()).toBe('2024-01-15T10:30:00.000Z');
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after specified milliseconds', async () => {
    const promise = sleep(1000);

    vi.advanceTimersByTime(999);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(1);
    await promise;
  });
});

describe('calculateBackoffDelay', () => {
  it('should return initial delay for first attempt', () => {
    const delay = calculateBackoffDelay(1, 1000, 30000);
    expect(delay).toBe(1000);
  });

  it('should double delay for each subsequent attempt', () => {
    expect(calculateBackoffDelay(2, 1000, 30000)).toBe(2000);
    expect(calculateBackoffDelay(3, 1000, 30000)).toBe(4000);
    expect(calculateBackoffDelay(4, 1000, 30000)).toBe(8000);
  });

  it('should not exceed max delay', () => {
    const delay = calculateBackoffDelay(10, 1000, 30000);
    expect(delay).toBe(30000);
  });

  it('should use custom multiplier', () => {
    const delay = calculateBackoffDelay(2, 1000, 30000, 3);
    expect(delay).toBe(3000);
  });
});

describe('isDefined', () => {
  it('should return true for defined values', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
  });

  it('should return false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('assertDefined', () => {
  it('should not throw for defined values', () => {
    expect(() => assertDefined('value', 'error')).not.toThrow();
    expect(() => assertDefined(0, 'error')).not.toThrow();
    expect(() => assertDefined(false, 'error')).not.toThrow();
  });

  it('should throw for null', () => {
    expect(() => assertDefined(null, 'Value is required')).toThrow(
      'Value is required'
    );
  });

  it('should throw for undefined', () => {
    expect(() => assertDefined(undefined, 'Value is required')).toThrow(
      'Value is required'
    );
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const result = safeJsonParse<{ name: string }>('{"name": "test"}');
    expect(result).toEqual({ name: 'test' });
  });

  it('should return undefined for invalid JSON', () => {
    const result = safeJsonParse('not json');
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const result = safeJsonParse('');
    expect(result).toBeUndefined();
  });

  it('should parse arrays', () => {
    const result = safeJsonParse<number[]>('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('Result helpers', () => {
  describe('ok', () => {
    it('should create a success result', () => {
      const result = ok({ value: 42 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ value: 42 });
      }
    });
  });

  describe('err', () => {
    it('should create an error result', () => {
      const result = err(new Error('Something went wrong'));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Something went wrong');
      }
    });

    it('should work with string errors', () => {
      const result = err('Error message');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Error message');
      }
    });
  });
});

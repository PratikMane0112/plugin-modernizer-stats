import { describe, it, expect } from 'vitest';
import { getRateTier } from '../../src/util/recipeStatus';

describe('getRateTier', () => {
  it('returns "high" for rate >= 80%', () => {
    expect(getRateTier(80)).toBe('high');
    expect(getRateTier(95.5)).toBe('high');
    expect(getRateTier(100)).toBe('high');
    console.log('  80, 95.5, 100 -> "high"');
  });

  it('returns "medium" for rate >= 50% and < 80%', () => {
    expect(getRateTier(50)).toBe('medium');
    expect(getRateTier(65)).toBe('medium');
    expect(getRateTier(79.9)).toBe('medium');
    console.log('  50, 65, 79.9 -> "medium"');
  });

  it('returns "low" for rate > 0% and < 50%', () => {
    expect(getRateTier(0.1)).toBe('low');
    expect(getRateTier(25)).toBe('low');
    expect(getRateTier(49.9)).toBe('low');
    console.log('  0.1, 25, 49.9 -> "low"');
  });

  it('returns "none" for rate = 0', () => {
    expect(getRateTier(0)).toBe('none');
    console.log('  0 -> "none"');
  });

  it('handles boundary values correctly', () => {
    expect(getRateTier(0)).toBe('none');
    expect(getRateTier(0.01)).toBe('low');
    expect(getRateTier(49.99)).toBe('low');
    expect(getRateTier(50)).toBe('medium');
    expect(getRateTier(79.99)).toBe('medium');
    expect(getRateTier(80)).toBe('high');
    console.log('  boundaries: 0=none, 0.01=low, 50=medium, 80=high');
  });
});

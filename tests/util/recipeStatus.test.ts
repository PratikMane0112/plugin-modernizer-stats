import { describe, it, expect } from 'vitest';
import { getRateTier, shortRecipeName, RATE_CARD_DEFS, computeSuccessRate } from '../../src/util/recipeStatus';
import type { RecipeReport } from '../../src/types';

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

describe('shortRecipeName', () => {
  it('extracts trailing class name from fully-qualified recipe ID', () => {
    expect(shortRecipeName('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile')).toBe('SetupJenkinsfile');
    console.log('  "io.jenkins.tools.pluginmodernizer.SetupJenkinsfile" -> "SetupJenkinsfile"');
  });

  it('returns the input unchanged when there are no dots', () => {
    expect(shortRecipeName('SetupJenkinsfile')).toBe('SetupJenkinsfile');
    console.log('  "SetupJenkinsfile" -> "SetupJenkinsfile"');
  });

  it('handles single-segment after last dot', () => {
    expect(shortRecipeName('a.b.c')).toBe('c');
    console.log('  "a.b.c" -> "c"');
  });

  it('handles empty string', () => {
    expect(shortRecipeName('')).toBe('');
    console.log('  "" -> ""');
  });
});

describe('computeSuccessRate', () => {
  const make = (successCount: number, totalApplications: number): RecipeReport => ({
    recipeId: 'test',
    totalApplications,
    successCount,
    failureCount: totalApplications - successCount,
    plugins: [],
  });

  it('computes rate as percentage', () => {
    expect(computeSuccessRate(make(2, 4))).toBeCloseTo(50, 5);
    expect(computeSuccessRate(make(3, 3))).toBeCloseTo(100, 5);
    console.log('  2/4 -> 50%, 3/3 -> 100%');
  });

  it('returns 0 when totalApplications is 0', () => {
    expect(computeSuccessRate(make(0, 0))).toBe(0);
    console.log('  0/0 -> 0%');
  });
});

describe('RATE_CARD_DEFS', () => {
  it('has exactly four tier definitions', () => {
    expect(RATE_CARD_DEFS).toHaveLength(4);
    console.log(`  RATE_CARD_DEFS has ${RATE_CARD_DEFS.length} entries`);
  });

  it('covers all four tiers in order', () => {
    expect(RATE_CARD_DEFS.map((d) => d.key)).toEqual(['high', 'medium', 'low', 'none']);
    console.log('  tiers in order: high, medium, low, none');
  });
});

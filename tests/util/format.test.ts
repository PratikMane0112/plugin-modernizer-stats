import { describe, it, expect } from 'vitest';
import { formatTimestamp } from '../../src/util/format';

describe('formatTimestamp', () => {
  it('formats a dash-separated Jenkins timestamp to YYYY-MM-DD', () => {
    expect(formatTimestamp('2025-09-03T08-05-48')).toBe('2025-09-03');
    console.log('  "2025-09-03T08-05-48" -> "2025-09-03"');
  });

  it('formats an ISO timestamp', () => {
    expect(formatTimestamp('2025-09-03T08:05:48')).toBe('2025-09-03');
    console.log('  "2025-09-03T08:05:48" -> "2025-09-03"');
  });

  it('returns "—" for null', () => {
    expect(formatTimestamp(null)).toBe('—');
    console.log('  null -> "—"');
  });

  it('returns "—" for undefined', () => {
    expect(formatTimestamp(undefined)).toBe('—');
    console.log('  undefined -> "—"');
  });

  it('returns "—" for empty string', () => {
    expect(formatTimestamp('')).toBe('—');
    console.log('  "" -> "—"');
  });

  it('returns raw input for unparseable string', () => {
    expect(formatTimestamp('not-a-date')).toBe('not-a-date');
    console.log('  "not-a-date" -> "not-a-date"');
  });

  it('handles real AddCodeOwner timestamp', () => {
    expect(formatTimestamp('2026-01-12T17-19-54')).toBe('2026-01-12');
    console.log('  "2026-01-12T17-19-54" -> "2026-01-12"');
  });

  it('handles real MigrateToJUnit5 timestamp', () => {
    expect(formatTimestamp('2025-10-05T13-47-45')).toBe('2025-10-05');
    console.log('  "2025-10-05T13-47-45" -> "2025-10-05"');
  });
});

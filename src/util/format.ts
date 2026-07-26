/**
 * Normalise the dash-separated time portion of a Jenkins timestamp
 * (e.g. "2025-09-03T08-05-48") into colons ("2025-09-03T08:05:48"),
 * then format the result as a locale-independent YYYY-MM-DD string.
 *
 * Returns '—' for null/undefined and returns the raw input when
 * the timestamp cannot be parsed.
 */
export function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return '—';
  const normalized = ts.replace(/T(\d{2})-(\d{2})-(\d{2})$/, 'T$1:$2:$3');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString('en-CA');
}

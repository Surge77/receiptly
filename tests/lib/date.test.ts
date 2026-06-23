import {
  isoDateToEpochMs,
  monthKey,
  monthRange,
  parseReceiptDate,
} from '@/lib/date';

describe('date', () => {
  it.each([
    ['12/05/2024', '2024-05-12'],
    ['15-04-2024', '2024-04-15'],
    ['01.02.2024', '2024-02-01'],
    ['2024-12-01', '2024-12-01'],
    ['05 Jan 2024', '2024-01-05'],
  ])('parses receipt date "%s" → %s', (input, expected) => {
    expect(parseReceiptDate(input)).toBe(expected);
  });

  it('returns null for unrecognized date text', () => {
    expect(parseReceiptDate('not a date')).toBeNull();
  });

  it('round-trips ISO date to epoch ms and back to month key', () => {
    const ms = isoDateToEpochMs('2024-05-12');
    expect(monthKey(ms)).toBe('2024-05');
  });

  it('computes an inclusive/exclusive month range', () => {
    const { start, end } = monthRange('2024-02');
    expect(monthKey(start)).toBe('2024-02');
    expect(end).toBeGreaterThan(start);
    expect(monthKey(end)).toBe('2024-03');
  });
});

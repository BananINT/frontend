import { describe, it, expect } from 'vitest';
import { formatNumber } from './format';

describe('formatNumber utility', () => {
  it('formats small numbers (< 1000) as raw integers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands (k), millions (M), and billions (B)', () => {
    expect(formatNumber(1000)).toBe('1k');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(10_000_000)).toBe('10M');
    expect(formatNumber(1_500_000_000)).toBe('1.5B');
  });

  it('formats trillions (T) and quadrillions (Qa)', () => {
    expect(formatNumber(1_000_000_000_000)).toBe('1T');
    expect(formatNumber(50_000_000_000_000_000)).toBe('50Qa');
  });
});

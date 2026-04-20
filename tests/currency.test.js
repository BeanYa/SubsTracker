import { describe, expect, it } from 'vitest';

import { convertToCNY, FALLBACK_RATES } from '../src/core/currency.js';

describe('convertToCNY', () => {
  it('uses fallback rates in the same direction as API rates', () => {
    expect(convertToCNY(10, 'USD', FALLBACK_RATES)).toBeCloseTo(69.8, 2);
    expect(convertToCNY(100, 'TWD', FALLBACK_RATES)).toBeCloseTo(22, 2);
  });
});

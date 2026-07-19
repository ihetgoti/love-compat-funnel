import { describe, it, expect } from 'vitest';
import { PRICING, COUNTRY_CODES, UPSELL_MULTIPLIER, getPricing, formatMoney } from '../pricing';

describe('PPP pricing', () => {
  it('covers all 7 target markets', () => {
    expect(COUNTRY_CODES.sort()).toEqual(['AU', 'GB', 'IN', 'NZ', 'TH', 'US', 'VN'].sort());
  });

  it('upsell is EXACTLY 10× the micro price in every market', () => {
    for (const code of COUNTRY_CODES) {
      const p = PRICING[code];
      expect(p.upsell, `${code} upsell must be 10× micro`).toBeCloseTo(p.micro * UPSELL_MULTIPLIER, 2);
    }
  });

  it('anchor (compareAt) is always above the sale price', () => {
    for (const code of COUNTRY_CODES) {
      const p = PRICING[code];
      expect(p.microCompareAt).toBeGreaterThan(p.micro);
      expect(p.upsellCompareAt).toBeGreaterThan(p.upsell);
    }
  });

  it('getPricing falls back to USD for unknown/null', () => {
    expect(getPricing(null).code).toBe('US');
    expect(getPricing(undefined).code).toBe('US');
  });

  it('formats whole-unit currencies without decimals and USD with', () => {
    expect(formatMoney(99, 'IN')).toMatch(/99/);
    expect(formatMoney(99, 'IN')).not.toMatch(/99\.00/);
    expect(formatMoney(4.99, 'US')).toMatch(/4\.99/);
    expect(formatMoney(99000, 'VN')).toMatch(/99/);
  });
});

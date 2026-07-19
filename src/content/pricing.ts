/**
 * Purchasing-power-adjusted (PPP) pricing per market.
 *
 * Price points are market-appropriate, NOT raw FX conversions (₹99 is a classic
 * Indian impulse price; $4.99 ≈ ₹420 would kill IN conversion). The premium
 * upsell is ALWAYS exactly 10× the micro price in every market — enforced by a
 * unit test. Payment is still simulated; these amounts map 1:1 onto a real
 * gateway (Razorpay for IN, Stripe elsewhere) later.
 */

export type CountryCode = 'IN' | 'US' | 'GB' | 'AU' | 'NZ' | 'TH' | 'VN';

export interface MarketPricing {
  code: CountryCode;
  country: string;
  flag: string;
  currency: string; // ISO 4217
  locale: string; // for Intl.NumberFormat
  micro: number;
  microCompareAt: number; // anchor price shown struck-through
  upsell: number; // always micro × 10
  upsellCompareAt: number;
}

export const UPSELL_MULTIPLIER = 10;

export const PRICING: Record<CountryCode, MarketPricing> = {
  IN: { code: 'IN', country: 'India', flag: '🇮🇳', currency: 'INR', locale: 'en-IN', micro: 99, microCompareAt: 399, upsell: 990, upsellCompareAt: 1999 },
  US: { code: 'US', country: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US', micro: 4.99, microCompareAt: 19, upsell: 49.9, upsellCompareAt: 99 },
  GB: { code: 'GB', country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', locale: 'en-GB', micro: 3.99, microCompareAt: 15, upsell: 39.9, upsellCompareAt: 79 },
  AU: { code: 'AU', country: 'Australia', flag: '🇦🇺', currency: 'AUD', locale: 'en-AU', micro: 6.99, microCompareAt: 29, upsell: 69.9, upsellCompareAt: 139 },
  NZ: { code: 'NZ', country: 'New Zealand', flag: '🇳🇿', currency: 'NZD', locale: 'en-NZ', micro: 7.99, microCompareAt: 32, upsell: 79.9, upsellCompareAt: 159 },
  TH: { code: 'TH', country: 'Thailand', flag: '🇹🇭', currency: 'THB', locale: 'th-TH', micro: 149, microCompareAt: 590, upsell: 1490, upsellCompareAt: 2990 },
  VN: { code: 'VN', country: 'Vietnam', flag: '🇻🇳', currency: 'VND', locale: 'vi-VN', micro: 99000, microCompareAt: 399000, upsell: 990000, upsellCompareAt: 1990000 },
};

export const COUNTRY_CODES = Object.keys(PRICING) as CountryCode[];

export function getPricing(code: CountryCode | null | undefined): MarketPricing {
  return PRICING[(code ?? 'US') as CountryCode] ?? PRICING.US;
}

/** Format an amount in a market's currency (₹99 · $4.99 · ₫99.000 …). */
export function formatMoney(amount: number, code: CountryCode): string {
  const p = getPricing(code);
  const wholeCurrency = ['INR', 'THB', 'VND'].includes(p.currency) || Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(p.locale, {
      style: 'currency',
      currency: p.currency,
      minimumFractionDigits: wholeCurrency ? 0 : 2,
      maximumFractionDigits: wholeCurrency ? 0 : 2,
    }).format(amount);
  } catch {
    return `${p.currency} ${amount}`;
  }
}

const TZ_MAP: Array<[RegExp, CountryCode]> = [
  [/^Asia\/(Kolkata|Calcutta)$/, 'IN'],
  [/^Asia\/Bangkok$/, 'TH'],
  [/^Asia\/(Ho_Chi_Minh|Saigon)$/, 'VN'],
  [/^Australia\//, 'AU'],
  [/^Pacific\/(Auckland|Chatham)$/, 'NZ'],
  [/^Europe\/(London|Belfast)$/, 'GB'],
  [/^America\//, 'US'],
  [/^Pacific\/Honolulu$/, 'US'],
];

/**
 * Best-effort market detection with zero network calls: device timezone first
 * (reliable for IN/TH/VN/AU/NZ/GB), then browser-locale region. Falls back to
 * USD for everywhere else. Users can always switch manually.
 */
export function detectCountry(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    for (const [re, code] of TZ_MAP) if (re.test(tz)) return code;
    const lang = typeof navigator !== 'undefined' ? navigator.language : '';
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && region in PRICING) return region as CountryCode;
  } catch {
    /* SSR or restricted env */
  }
  return 'US';
}

'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { COUNTRY_CODES, PRICING, type CountryCode } from '@/content/pricing';
import { haptic } from '@/design/haptics';

/** Compact market/currency switcher (auto-detected; manual pick wins forever). */
export function CurrencyPicker() {
  const currency = useQuizStore((s) => s.currency);
  const setCurrency = useQuizStore((s) => s.setCurrency);
  const p = PRICING[currency];

  return (
    <label className="relative inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-starlight">
      <span aria-hidden>{p.flag}</span>
      <span>{p.currency}</span>
      <span aria-hidden className="text-muted">▾</span>
      <select
        aria-label="Choose your currency"
        value={currency}
        onChange={(e) => {
          haptic('select');
          setCurrency(e.target.value as CountryCode, true);
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c} value={c}>
            {PRICING[c].flag} {PRICING[c].country} ({PRICING[c].currency})
          </option>
        ))}
      </select>
    </label>
  );
}

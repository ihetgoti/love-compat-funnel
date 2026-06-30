import type {
  ZodiacSign,
  ZodiacSignId,
  ZodiacElement,
  ZodiacModality,
} from './types';

/** Full zodiac metadata. */
export const ZODIAC: Record<ZodiacSignId, ZodiacSign> = {
  aries: { id: 'aries', name: 'Aries', glyph: '♈', emoji: '🐏', element: 'fire', modality: 'cardinal', polarity: 'yang', rulingPlanet: 'Mars', dateLabel: 'Mar 21 – Apr 19' },
  taurus: { id: 'taurus', name: 'Taurus', glyph: '♉', emoji: '🐂', element: 'earth', modality: 'fixed', polarity: 'yin', rulingPlanet: 'Venus', dateLabel: 'Apr 20 – May 20' },
  gemini: { id: 'gemini', name: 'Gemini', glyph: '♊', emoji: '👯', element: 'air', modality: 'mutable', polarity: 'yang', rulingPlanet: 'Mercury', dateLabel: 'May 21 – Jun 20' },
  cancer: { id: 'cancer', name: 'Cancer', glyph: '♋', emoji: '🦀', element: 'water', modality: 'cardinal', polarity: 'yin', rulingPlanet: 'Moon', dateLabel: 'Jun 21 – Jul 22' },
  leo: { id: 'leo', name: 'Leo', glyph: '♌', emoji: '🦁', element: 'fire', modality: 'fixed', polarity: 'yang', rulingPlanet: 'Sun', dateLabel: 'Jul 23 – Aug 22' },
  virgo: { id: 'virgo', name: 'Virgo', glyph: '♍', emoji: '🌾', element: 'earth', modality: 'mutable', polarity: 'yin', rulingPlanet: 'Mercury', dateLabel: 'Aug 23 – Sep 22' },
  libra: { id: 'libra', name: 'Libra', glyph: '♎', emoji: '⚖️', element: 'air', modality: 'cardinal', polarity: 'yang', rulingPlanet: 'Venus', dateLabel: 'Sep 23 – Oct 22' },
  scorpio: { id: 'scorpio', name: 'Scorpio', glyph: '♏', emoji: '🦂', element: 'water', modality: 'fixed', polarity: 'yin', rulingPlanet: 'Pluto', dateLabel: 'Oct 23 – Nov 21' },
  sagittarius: { id: 'sagittarius', name: 'Sagittarius', glyph: '♐', emoji: '🏹', element: 'fire', modality: 'mutable', polarity: 'yang', rulingPlanet: 'Jupiter', dateLabel: 'Nov 22 – Dec 21' },
  capricorn: { id: 'capricorn', name: 'Capricorn', glyph: '♑', emoji: '🐐', element: 'earth', modality: 'cardinal', polarity: 'yin', rulingPlanet: 'Saturn', dateLabel: 'Dec 22 – Jan 19' },
  aquarius: { id: 'aquarius', name: 'Aquarius', glyph: '♒', emoji: '🌊', element: 'air', modality: 'fixed', polarity: 'yang', rulingPlanet: 'Uranus', dateLabel: 'Jan 20 – Feb 18' },
  pisces: { id: 'pisces', name: 'Pisces', glyph: '♓', emoji: '🐟', element: 'water', modality: 'mutable', polarity: 'yin', rulingPlanet: 'Neptune', dateLabel: 'Feb 19 – Mar 20' },
};

/** Sun sign from a (1-based month, day) pair. */
export function signIdFromDate(month: number, day: number): ZodiacSignId {
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return 'aries';
  if (md >= 420 && md <= 520) return 'taurus';
  if (md >= 521 && md <= 620) return 'gemini';
  if (md >= 621 && md <= 722) return 'cancer';
  if (md >= 723 && md <= 822) return 'leo';
  if (md >= 823 && md <= 922) return 'virgo';
  if (md >= 923 && md <= 1022) return 'libra';
  if (md >= 1023 && md <= 1121) return 'scorpio';
  if (md >= 1122 && md <= 1221) return 'sagittarius';
  if (md >= 1222 || md <= 119) return 'capricorn';
  if (md >= 120 && md <= 218) return 'aquarius';
  return 'pisces'; // 219 – 320
}

/** Parse an ISO yyyy-mm-dd date into the zodiac sign. Falls back to Libra. */
export function getZodiac(dob: string | null): ZodiacSign {
  if (!dob) return ZODIAC.libra;
  const [, m, d] = dob.split('-').map((p) => parseInt(p, 10));
  if (!m || !d) return ZODIAC.libra;
  return ZODIAC[signIdFromDate(m, d)];
}

/** Element compatibility 0..1 (warm — never punitively low). */
export function elementCompat(a: ZodiacElement, b: ZodiacElement): number {
  if (a === b) return 0.92;
  const key = [a, b].sort().join('-');
  const table: Record<string, number> = {
    'air-fire': 0.88, // fan the flame
    'earth-water': 0.86, // nourishing
    'air-water': 0.6,
    'earth-fire': 0.55,
    'air-earth': 0.62,
    'fire-water': 0.5,
  };
  return table[key] ?? 0.6;
}

/** Modality harmony 0..1 — different modalities often complement. */
export function modalityHarmony(a: ZodiacModality, b: ZodiacModality): number {
  if (a === b) return a === 'fixed' ? 0.66 : 0.74; // two fixed can dig in
  const key = [a, b].sort().join('-');
  const table: Record<string, number> = {
    'cardinal-mutable': 0.86,
    'fixed-mutable': 0.82,
    'cardinal-fixed': 0.74,
  };
  return table[key] ?? 0.78;
}

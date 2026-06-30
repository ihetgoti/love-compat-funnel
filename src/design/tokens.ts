/**
 * Central design tokens.
 *
 * These raw values are mirrored in `globals.css` (`@theme`) for Tailwind utilities,
 * but are ALSO needed in plain JS by the runtime art system (Canvas share-card,
 * SVG gradient builders) which cannot read CSS custom properties at draw time.
 * Keep the two in sync — this file is the source of truth for art code.
 */

export const palette = {
  ink: '#0e0820',
  night: '#160d28',
  night2: '#241141',
  plum: '#3a1d5e',
  plumSoft: '#4a2772',
  rose: '#ff5d8f',
  roseDeep: '#e23e74',
  blush: '#ffb3c8',
  gold: '#ffd27d',
  goldDeep: '#f5b54a',
  starlight: '#fff4fb',
  lavender: '#c9a7ff',
  aura: '#8ad7ff',
  muted: '#b8a9d9',
} as const;

export type PaletteKey = keyof typeof palette;

export const gradients = {
  romance: ['#ff5d8f', '#ffb86b'] as const,
  dusk: ['#160d28', '#3a1d5e'] as const,
  aurora: ['#8ad7ff', '#c9a7ff', '#ff5d8f'] as const,
  gold: ['#ffe9b0', '#f5b54a'] as const,
  night: ['#0e0820', '#241141'] as const,
};

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

export const elementColors: Record<ZodiacElement, string> = {
  fire: '#ff7a59',
  earth: '#8fd17a',
  air: '#8ad7ff',
  water: '#7aa7ff',
};

export const radii = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 } as const;

/** Framer Motion-friendly durations (seconds). */
export const durations = { fast: 0.18, base: 0.32, slow: 0.6, scene: 0.5 } as const;

/** Convert a hex color to rgba() with alpha — used by Canvas/SVG art. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

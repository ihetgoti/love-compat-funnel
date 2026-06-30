import type { PersonProfile, ZodiacElement } from './types';
import { type RNG, sample } from './seededRandom';

/**
 * Generates personalized "You both may…" shared-trait statements.
 * Candidates are biased by shared element / archetype so the list feels earned,
 * then sampled deterministically. Always possibility-framed and warm.
 */

const UNIVERSAL: string[] = [
  'You both light up during deep, late-night conversations.',
  'You both crave emotional honesty over surface-level small talk.',
  'You both secretly love being chosen — again and again.',
  'You both remember the little details that others forget.',
  'You both feel most alive when you’re discovering something new together.',
  'You both value loyalty far more than grand gestures.',
  'You both communicate a lot through small, quiet acts of care.',
  'You both light up at the idea of a spontaneous getaway.',
  'You both appreciate a partner who can make you laugh mid-argument.',
  'You both believe the right person should also feel like home.',
  'You both tend to give more than you ask for in return.',
  'You both fall harder for energy and presence than for looks.',
  'You both enjoy slow mornings and unhurried weekends.',
  'You both keep a soft spot for nostalgic songs and old memories.',
  'You both want to be fully seen — not just admired.',
  'You both find comfort in routines you build just for the two of you.',
];

const ELEMENT_LINES: Record<ZodiacElement, string[]> = {
  fire: [
    'You both bring bold, contagious energy into a room.',
    'You both would rather take the leap than wonder “what if”.',
    'You both find passion irresistible — boredom is the real enemy.',
  ],
  earth: [
    'You both quietly build something that lasts.',
    'You both find romance in reliability and showing up.',
    'You both appreciate the beauty in simple, sensory moments — good food, soft light.',
  ],
  air: [
    'You both fall for a brilliant mind and a quick wit.',
    'You both could talk for hours and still have more to say.',
    'You both need a little freedom to feel close.',
  ],
  water: [
    'You both feel everything deeply — and love that way too.',
    'You both can read a room (and each other) without a word.',
    'You both treasure emotional safety above almost anything.',
  ],
};

const LOVE_LANGUAGE_LINE = (a: PersonProfile, b: PersonProfile): string | null => {
  if (a.archetype.loveLanguage === b.archetype.loveLanguage) {
    return `You both express love the same way — through ${a.archetype.loveLanguage.toLowerCase()}.`;
  }
  return `You both speak love in complementary ways — ${a.archetype.loveLanguage.toLowerCase()} meets ${b.archetype.loveLanguage.toLowerCase()}.`;
};

export function getCommonThings(args: {
  a: PersonProfile;
  b: PersonProfile;
  rng: RNG;
  count?: number;
}): string[] {
  const { a, b, rng } = args;
  const count = args.count ?? 7;

  const candidates: string[] = [...UNIVERSAL];

  // Bias toward each person's elemental flavor.
  candidates.push(...ELEMENT_LINES[a.zodiac.element]);
  if (b.zodiac.element !== a.zodiac.element) {
    candidates.push(...ELEMENT_LINES[b.zodiac.element]);
  } else {
    // Shared element — double down to make it likely to surface.
    candidates.push(...ELEMENT_LINES[a.zodiac.element]);
  }

  const ll = LOVE_LANGUAGE_LINE(a, b);
  if (ll) candidates.push(ll);

  // De-dupe while preserving the bias weighting via a Set on output, not input.
  const picked = sample(rng, candidates, count + 3);
  const unique: string[] = [];
  for (const line of picked) {
    if (!unique.includes(line)) unique.push(line);
    if (unique.length >= count) break;
  }
  return unique;
}

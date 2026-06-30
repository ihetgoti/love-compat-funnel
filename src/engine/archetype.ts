import type { Archetype, ArchetypeId, ZodiacElement, ZodiacModality } from './types';

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  dreamer: {
    id: 'dreamer', short: 'Romantic Dreamer', title: 'The Romantic Dreamer', emoji: '🌙', affinity: 'water',
    blurb: 'Tender, intuitive, and endlessly devoted — they love with their whole imagination.',
    strengths: ['Deeply empathetic', 'Romantic to the core', 'Reads emotions effortlessly'],
    loveLanguage: 'Quality time & whispered words',
  },
  adventurer: {
    id: 'adventurer', short: 'Adventurer', title: 'The Adventurer', emoji: '🔥', affinity: 'fire',
    blurb: 'Spontaneous and magnetic — they turn ordinary days into stories worth telling.',
    strengths: ['Fearlessly passionate', 'Brings the spark', 'Says yes to life'],
    loveLanguage: 'Shared experiences',
  },
  nurturer: {
    id: 'nurturer', short: 'Nurturer', title: 'The Nurturer', emoji: '🌷', affinity: 'water',
    blurb: 'Warm and steady — they make people feel safe, seen, and unconditionally cared for.',
    strengths: ['Naturally caring', 'Loyal and present', 'Creates a soft place to land'],
    loveLanguage: 'Acts of care',
  },
  explorer: {
    id: 'explorer', short: 'Explorer', title: 'The Explorer', emoji: '🧭', affinity: 'air',
    blurb: 'Curious and free — they fall for minds, ideas, and the thrill of discovering you.',
    strengths: ['Open-minded', 'Playful & witty', 'Always growing'],
    loveLanguage: 'Discovery together',
  },
  visionary: {
    id: 'visionary', short: 'Visionary', title: 'The Visionary', emoji: '✨', affinity: 'air',
    blurb: 'Idealistic and inspired — they love with purpose and dream the relationship bigger.',
    strengths: ['Inspiring presence', 'Sees the best in you', 'Future-focused'],
    loveLanguage: 'Words of affirmation',
  },
  creator: {
    id: 'creator', short: 'Creator', title: 'The Creator', emoji: '🎨', affinity: 'earth',
    blurb: 'Expressive and devoted — they build beauty, rituals, and a world around the ones they love.',
    strengths: ['Thoughtful gestures', 'Builds lasting things', 'Aesthetic soul'],
    loveLanguage: 'Gifts & rituals',
  },
  leader: {
    id: 'leader', short: 'Leader', title: 'The Leader', emoji: '👑', affinity: 'fire',
    blurb: 'Confident and protective — they love boldly and show up when it matters most.',
    strengths: ['Decisive & loyal', 'Champions their person', 'Brings stability'],
    loveLanguage: 'Showing up',
  },
  protector: {
    id: 'protector', short: 'Protector', title: 'The Protector', emoji: '🛡️', affinity: 'earth',
    blurb: 'Grounded and dependable — the quiet strength that makes love feel like home.',
    strengths: ['Rock-solid reliable', 'Calm under pressure', 'Fiercely devoted'],
    loveLanguage: 'Acts of service',
  },
};

const BY_ELEMENT: Record<ZodiacElement, ArchetypeId[]> = {
  fire: ['adventurer', 'leader', 'explorer'],
  earth: ['protector', 'creator', 'nurturer'],
  air: ['visionary', 'explorer', 'creator'],
  water: ['dreamer', 'nurturer', 'visionary'],
};

/** Deterministically resolve a person's archetype. Every archetype is reachable. */
export function archetypeFor(args: {
  element: ZodiacElement;
  modality: ZodiacModality;
  lifePath: number;
  seed: number;
}): Archetype {
  const candidates = BY_ELEMENT[args.element];
  const modalityShift = args.modality === 'cardinal' ? 0 : args.modality === 'fixed' ? 1 : 2;
  const idx = (args.lifePath + modalityShift + (args.seed % 3)) % candidates.length;
  return ARCHETYPES[candidates[idx]];
}

/** Synergy 0..1 between two archetypes. Complementary pairs score highest. */
export function archetypeSynergy(a: ArchetypeId, b: ArchetypeId): number {
  if (a === b) return 0.8; // mirror souls
  const key = [a, b].sort().join('-');
  const great: Record<string, number> = {
    'dreamer-protector': 0.94, 'adventurer-nurturer': 0.92, 'leader-nurturer': 0.93,
    'dreamer-leader': 0.9, 'explorer-creator': 0.89, 'visionary-protector': 0.9,
    'adventurer-creator': 0.88, 'explorer-nurturer': 0.88, 'dreamer-adventurer': 0.86,
    'creator-leader': 0.87, 'visionary-nurturer': 0.89, 'explorer-protector': 0.86,
    'dreamer-visionary': 0.85, 'adventurer-protector': 0.84, 'creator-protector': 0.83,
    'leader-visionary': 0.85, 'explorer-leader': 0.84, 'creator-dreamer': 0.86,
    'adventurer-explorer': 0.82, 'nurturer-protector': 0.84, 'visionary-creator': 0.82,
  };
  return great[key] ?? 0.76;
}

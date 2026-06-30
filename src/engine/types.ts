/** Shared types for the local, deterministic compatibility engine. */

export type Gender = 'male' | 'female' | 'nonbinary' | 'unspecified';

export interface Person {
  name: string;
  gender: Gender;
  dob: string | null; // ISO yyyy-mm-dd
}

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable';
export type ZodiacSignId =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface ZodiacSign {
  id: ZodiacSignId;
  name: string;
  glyph: string; // unicode astrological glyph, e.g. ♈
  emoji: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  polarity: 'yin' | 'yang';
  rulingPlanet: string;
  dateLabel: string;
}

export type ArchetypeId =
  | 'dreamer' | 'adventurer' | 'nurturer' | 'explorer'
  | 'visionary' | 'creator' | 'leader' | 'protector';

export interface Archetype {
  id: ArchetypeId;
  title: string; // "The Romantic Dreamer"
  short: string; // "Romantic Dreamer"
  emoji: string;
  blurb: string;
  strengths: string[];
  loveLanguage: string;
  affinity: ZodiacElement;
}

export interface PersonProfile {
  person: Person;
  zodiac: ZodiacSign;
  lifePath: number;
  archetype: Archetype;
  age: number | null;
}

export type SubscoreKey =
  | 'soulmate' | 'future' | 'chemistry' | 'communication'
  | 'growth' | 'emotional' | 'longterm';

export interface Subscore {
  key: SubscoreKey;
  label: string;
  score: number; // 0..100
  teaser: string;
  detail: string;
  icon: string;
}

export interface ResultFlags {
  sameSign: boolean;
  sameElement: boolean;
  sameBirthday: boolean;
  ageGapYears: number;
  masterNumber: boolean;
  sharedLifePath: boolean;
  veryHighScore: boolean;
}

export interface Highlight {
  icon: string;
  title: string;
  text: string;
}

export interface CompatibilityResult {
  score: number; // 0..100 overall, feel-good banded
  label: string; // "Excellent Match"
  tagline: string;
  seed: number;
  you: PersonProfile;
  partner: PersonProfile;
  subscores: Subscore[];
  commonThings: string[];
  overview: string;
  advice: string[];
  highlights: Highlight[];
  flags: ResultFlags;
}

export interface EngineInput {
  you: Person;
  partner: Person;
  relationshipType: string | null;
  answers: Record<string, string | string[]>;
}

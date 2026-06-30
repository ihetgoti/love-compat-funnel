import type {
  CompatibilityResult,
  EngineInput,
  Person,
  PersonProfile,
  ResultFlags,
  Subscore,
  SubscoreKey,
  ZodiacElement,
} from './types';
import { getZodiac, elementCompat, modalityHarmony } from './zodiac';
import { lifePathFromDob, lifePathCompat, isMasterNumber } from './numerology';
import { archetypeFor, archetypeSynergy } from './archetype';
import { getCommonThings } from './commonThings';
import { hashSeed, mulberry32, unitFrom, clamp } from './seededRandom';
import {
  type NarrativeCtx,
  taglineFor,
  overviewFor,
  adviceFor,
  highlightsFor,
  subscoreCopy,
  labelFor,
  SUBSCORE_META,
} from './narrative';

const DAY = 86_400_000;

function norm(s: string | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function isoToUTC(dob: string): number | null {
  const [y, m, d] = dob.split('-').map((p) => parseInt(p, 10));
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d);
}

function diffYears(aIso: string, bIso: string): number {
  const a = isoToUTC(aIso);
  const b = isoToUTC(bIso);
  if (a == null || b == null) return 0;
  return (a - b) / (365.25 * DAY);
}

function ageFrom(dob: string | null, now: number): number | null {
  if (!dob) return null;
  const t = isoToUTC(dob);
  if (t == null) return null;
  return Math.max(0, Math.floor((now - t) / (365.25 * DAY)));
}

function sameMonthDay(aIso: string | null, bIso: string | null): boolean {
  if (!aIso || !bIso) return false;
  return aIso.slice(5) === bIso.slice(5);
}

function buildProfile(person: Person, personSeed: number, now: number): PersonProfile {
  const zodiac = getZodiac(person.dob);
  const lifePath = lifePathFromDob(person.dob);
  const archetype = archetypeFor({
    element: zodiac.element,
    modality: zodiac.modality,
    lifePath,
    seed: personSeed,
  });
  return { person, zodiac, lifePath, archetype, age: ageFrom(person.dob, now) };
}

/** Push a 0..1 component into a warm, feel-good 62..98 band. */
function toBanded(x: number): number {
  const eased = Math.pow(clamp(x, 0, 1), 0.72);
  return clamp(Math.round(60 + eased * 40), 62, 98);
}

/** Growth ("area to improve") sits lower but is never alarming: 56..84. */
function growthBand(x: number): number {
  const eased = Math.pow(clamp(x, 0, 1), 0.9);
  return clamp(Math.round(56 + eased * 28), 56, 84);
}

function first<T extends string | string[] | undefined>(v: T): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

/** Translate quiz answers into a 0..1 alignment component. Fully defensive. */
function answerAlignment(answers: Record<string, string | string[]>): number {
  let s = 0.6;
  const importance = parseInt(first(answers.importance), 10);
  if (!Number.isNaN(importance)) s += (clamp(importance, 1, 5) - 3) * 0.04;

  const destiny = first(answers.destiny);
  if (destiny === 'absolutely') s += 0.08;
  else if (destiny === 'maybe') s += 0.03;

  const connection = first(answers.connection);
  if (connection === 'often') s += 0.08;
  else if (connection === 'sometimes') s += 0.04;

  const word = first(answers.oneword);
  if (['magical', 'passionate', 'exciting', 'stable'].includes(word)) s += 0.06;
  else if (['complicated', 'uncertain'].includes(word)) s -= 0.03;

  const motivation = first(answers.motivation);
  if (['love', 'cantstop', 'future'].includes(motivation)) s += 0.05;

  return clamp(s, 0.3, 0.95);
}

/**
 * The main engine entry point. Deterministic: the same couple always produces the
 * same result. `now` only affects displayed ages, never the score or seed, so the
 * result is stable across days for testing and re-opening.
 */
export function computeCompatibility(
  input: EngineInput,
  now: number = Date.now(),
): CompatibilityResult {
  const seed = hashSeed(
    input.you.dob ?? 'y',
    input.partner.dob ?? 'p',
    norm(input.you.name),
    norm(input.partner.name),
    input.relationshipType ?? 'rt',
  );
  const rng = mulberry32(seed);

  const you = buildProfile(input.you, hashSeed(seed, 'you', input.you.dob ?? ''), now);
  const partner = buildProfile(
    input.partner,
    hashSeed(seed, 'partner', input.partner.dob ?? ''),
    now,
  );

  // Components (0..1)
  const el = elementCompat(you.zodiac.element, partner.zodiac.element);
  const mod = modalityHarmony(you.zodiac.modality, partner.zodiac.modality);
  const lp = lifePathCompat(you.lifePath, partner.lifePath);
  const arch = archetypeSynergy(you.archetype.id, partner.archetype.id);
  const ans = answerAlignment(input.answers);
  const jitter = rng();

  const raw = 0.22 * el + 0.1 * mod + 0.2 * lp + 0.2 * arch + 0.18 * ans + 0.1 * jitter;
  const score = toBanded(raw);
  const label = labelFor(score);

  const flags: ResultFlags = {
    sameSign: you.zodiac.id === partner.zodiac.id,
    sameElement: you.zodiac.element === partner.zodiac.element,
    sameBirthday: sameMonthDay(you.person.dob, partner.person.dob),
    ageGapYears:
      you.person.dob && partner.person.dob
        ? Math.abs(Math.round(diffYears(you.person.dob, partner.person.dob)))
        : 0,
    masterNumber: isMasterNumber(you.lifePath) || isMasterNumber(partner.lifePath),
    sharedLifePath: you.lifePath === partner.lifePath,
    veryHighScore: score >= 90,
  };

  const ctx: NarrativeCtx = {
    you,
    partner,
    score,
    label,
    relationshipType: input.relationshipType,
    flags,
  };

  const tagline = taglineFor(ctx, rng);
  const overview = overviewFor(ctx, rng);
  const advice = adviceFor(ctx, rng);
  const highlights = highlightsFor(ctx, rng);
  const commonThings = getCommonThings({ a: you, b: partner, rng, count: 7 });

  const share = (elm: ZodiacElement) =>
    (you.zodiac.element === elm ? 0.5 : 0) + (partner.zodiac.element === elm ? 0.5 : 0);
  const polarityComplement = you.zodiac.polarity !== partner.zodiac.polarity ? 0.9 : 0.72;

  const blends: Record<SubscoreKey, number> = {
    soulmate: 0.4 * el + 0.3 * arch + 0.2 * lp + 0.1 * unitFrom(seed, 'soulmate'),
    future: 0.32 * lp + 0.28 * ans + 0.22 * mod + 0.18 * arch,
    chemistry: 0.42 * el + 0.28 * polarityComplement + 0.3 * unitFrom(seed, 'chemistry'),
    communication: 0.45 * mod + 0.3 * (0.55 + share('air') * 0.45) + 0.25 * ans,
    emotional: 0.4 * (0.5 + share('water') * 0.5) + 0.3 * el + 0.3 * ans,
    longterm: 0.34 * lp + 0.3 * mod + 0.26 * arch + 0.1 * ans,
    growth: 0.5 + 0.18 * unitFrom(seed, 'growth'),
  };

  const subscores: Subscore[] = (Object.keys(blends) as SubscoreKey[]).map((key) => {
    const meta = SUBSCORE_META[key];
    const sub = key === 'growth' ? growthBand(blends.growth) : toBanded(blends[key]);
    const copy = subscoreCopy(key, sub, ctx, rng);
    return { key, label: meta.label, icon: meta.icon, score: sub, teaser: copy.teaser, detail: copy.detail };
  });

  return {
    score,
    label,
    tagline,
    seed,
    you,
    partner,
    subscores,
    commonThings,
    overview,
    advice,
    highlights,
    flags,
  };
}

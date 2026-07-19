import { describe, it, expect } from 'vitest';
import { computeCompatibility } from '../compatibility';
import { lifePathFromDob, isMasterNumber, lifePathCompat } from '../numerology';
import { getZodiac, signIdFromDate } from '../zodiac';
import { archetypeFor, ARCHETYPES } from '../archetype';
import type { ArchetypeId, EngineInput, Gender, ZodiacElement, ZodiacModality } from '../types';

const NOW = Date.UTC(2026, 0, 1); // fixed reference so ages are deterministic in tests

function input(over: Partial<EngineInput> = {}): EngineInput {
  return {
    you: { name: 'Ava', gender: 'female' as Gender, dob: '1996-05-10' },
    partner: { name: 'Liam', gender: 'male' as Gender, dob: '1994-09-22' },
    relationshipType: 'crush',
    answers: { importance: '5', destiny: 'absolutely', connection: 'often', oneword: 'magical', motivation: 'love' },
    ...over,
  };
}

describe('numerology', () => {
  it('reduces to a single digit', () => {
    expect(lifePathFromDob('2000-01-01')).toBe(4);
  });
  it('preserves master numbers', () => {
    expect(lifePathFromDob('2000-09-29')).toBe(22);
    expect(isMasterNumber(22)).toBe(true);
    expect(isMasterNumber(7)).toBe(false);
  });
  it('life-path compat is warm and bounded', () => {
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++) {
        const c = lifePathCompat(a, b);
        expect(c).toBeGreaterThanOrEqual(0.5);
        expect(c).toBeLessThanOrEqual(1);
      }
  });
});

describe('zodiac', () => {
  it('maps boundary dates correctly', () => {
    expect(signIdFromDate(3, 21)).toBe('aries');
    expect(signIdFromDate(4, 19)).toBe('aries');
    expect(signIdFromDate(4, 20)).toBe('taurus');
    expect(signIdFromDate(12, 25)).toBe('capricorn');
    expect(signIdFromDate(1, 1)).toBe('capricorn');
    expect(signIdFromDate(1, 20)).toBe('aquarius');
    expect(signIdFromDate(2, 20)).toBe('pisces');
  });
  it('parses ISO dates', () => {
    expect(getZodiac('1996-05-10').id).toBe('taurus');
    expect(getZodiac(null).id).toBe('libra'); // safe fallback
  });
});

describe('archetypes', () => {
  it('every archetype is reachable', () => {
    const seen = new Set<ArchetypeId>();
    const els: ZodiacElement[] = ['fire', 'earth', 'air', 'water'];
    const mods: ZodiacModality[] = ['cardinal', 'fixed', 'mutable'];
    for (const element of els)
      for (const modality of mods)
        for (let lifePath = 1; lifePath <= 11; lifePath++)
          for (let seed = 0; seed < 6; seed++)
            seen.add(archetypeFor({ element, modality, lifePath, seed }).id);
    expect(seen.size).toBe(Object.keys(ARCHETYPES).length);
  });
});

describe('compatibility result', () => {
  it('is deterministic for the same couple', () => {
    const a = computeCompatibility(input(), NOW);
    const b = computeCompatibility(input(), NOW);
    expect(a).toEqual(b);
  });

  it('keeps the overall score in the warm band and finite', () => {
    const samples: EngineInput[] = [
      input(),
      input({ you: { name: 'Mia', gender: 'female', dob: '1988-12-31' }, partner: { name: 'Noah', gender: 'male', dob: '1990-07-04' } }),
      input({ answers: { oneword: 'complicated', destiny: 'maybe', connection: 'sometimes', importance: '2' } }),
      input({ you: { name: '', gender: 'unspecified', dob: '2001-02-19' }, partner: { name: '', gender: 'unspecified', dob: '1999-11-22' } }),
      input({ answers: {} }), // missing answers must still work
    ];
    for (const s of samples) {
      const r = computeCompatibility(s, NOW);
      expect(Number.isFinite(r.score)).toBe(true);
      expect(r.score).toBeGreaterThanOrEqual(62);
      expect(r.score).toBeLessThanOrEqual(98);
      expect(r.label).toBeTruthy();
      expect(r.subscores).toHaveLength(7);
      for (const sub of r.subscores) {
        expect(Number.isFinite(sub.score)).toBe(true);
        expect(sub.score).toBeGreaterThanOrEqual(1);
        expect(sub.score).toBeLessThanOrEqual(100);
        expect(sub.teaser).toBeTruthy();
      }
      const growth = r.subscores.find((x) => x.key === 'growth')!;
      expect(growth.score).toBeLessThanOrEqual(84);
    }
  });

  it('returns 7 unique common-things statements', () => {
    const r = computeCompatibility(input(), NOW);
    expect(r.commonThings).toHaveLength(7);
    expect(new Set(r.commonThings).size).toBe(7);
  });

  it('is gender-blind: same-gender couples score identically to any pairing', () => {
    const base = input();
    const ff = computeCompatibility(
      { ...base, you: { ...base.you, gender: 'female' }, partner: { ...base.partner, gender: 'female' } },
      NOW,
    );
    const mm = computeCompatibility(
      { ...base, you: { ...base.you, gender: 'male' }, partner: { ...base.partner, gender: 'male' } },
      NOW,
    );
    const mf = computeCompatibility(
      { ...base, you: { ...base.you, gender: 'female' }, partner: { ...base.partner, gender: 'male' } },
      NOW,
    );
    // Identical seed, score, subscores, and generated text — gender never enters the math.
    expect(ff.seed).toBe(mf.seed);
    expect(ff.score).toBe(mf.score);
    expect(mm.score).toBe(mf.score);
    expect(ff.subscores).toEqual(mf.subscores);
    expect(ff.commonThings).toEqual(mf.commonThings);
    expect(ff.overview).toBe(mf.overview);
  });

  it('computes context flags', () => {
    const sameBday = computeCompatibility(
      input({
        you: { name: 'A', gender: 'female', dob: '2000-05-10' },
        partner: { name: 'B', gender: 'male', dob: '1995-05-10' },
      }),
      NOW,
    );
    expect(sameBday.flags.sameBirthday).toBe(true);
    expect(sameBday.flags.ageGapYears).toBe(5);
  });
});

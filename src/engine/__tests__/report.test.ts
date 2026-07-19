import { describe, it, expect } from 'vitest';
import { computeCompatibility } from '../compatibility';
import { generateReport } from '../report';
import type { EngineInput, Gender } from '../types';

const NOW = Date.UTC(2026, 0, 1);

function make(over: Partial<EngineInput> = {}) {
  const input: EngineInput = {
    you: { name: 'Ava', gender: 'female' as Gender, dob: '1996-05-10' },
    partner: { name: 'Liam', gender: 'male' as Gender, dob: '1994-09-22' },
    relationshipType: 'crush',
    answers: {
      motivation: 'love',
      curiosity: 'chemistry',
      importance: '5',
      oneword: 'passionate',
      destiny: 'absolutely',
      connection: 'often',
      surprise: 'soulmates',
    },
    ...over,
  };
  const result = computeCompatibility(input, NOW);
  return { input, result };
}

describe('report engine', () => {
  it('is deterministic for the same couple + answers', () => {
    const { input, result } = make();
    const a = generateReport({ result, answers: input.answers, relationshipType: input.relationshipType });
    const b = generateReport({ result, answers: input.answers, relationshipType: input.relationshipType });
    expect(a).toEqual(b);
  });

  it('produces 8 core sections and 8 premium sections, all non-empty', () => {
    const { input, result } = make();
    const rep = generateReport({ result, answers: input.answers, relationshipType: input.relationshipType });
    expect(rep.sections).toHaveLength(8);
    expect(rep.premiumSections).toHaveLength(8);
    expect(rep.intro.length).toBeGreaterThan(0);
    expect(rep.closing).toBeTruthy();
    for (const s of [...rep.sections, ...rep.premiumSections]) {
      expect(s.title).toBeTruthy();
      expect(s.headline).toBeTruthy();
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.body.every((p) => p.length > 0)).toBe(true);
    }
  });

  it('hoists + stars the section the user was most curious about', () => {
    const cases: Array<[string, string]> = [
      ['soulmate', 'soulmate'],
      ['chemistry', 'chemistry'],
      ['communication', 'communication'],
      ['challenges', 'growth'],
      ['emotional', 'emotional'],
      ['future', 'future'],
    ];
    for (const [answer, expectedKey] of cases) {
      const { input, result } = make({
        answers: { curiosity: answer, importance: '3', destiny: 'maybe', connection: 'sometimes' },
      });
      const rep = generateReport({ result, answers: input.answers, relationshipType: 'crush' });
      expect(rep.sections[0].key).toBe(expectedKey);
      expect(rep.sections[0].starred).toBe(true);
    }
  });

  it('weaves specific answers into the copy', () => {
    const { input, result } = make({
      answers: { motivation: 'future', oneword: 'complicated', importance: '5', destiny: 'notsure', connection: 'notyet', surprise: 'challenges', curiosity: 'soulmate' },
    });
    const rep = generateReport({ result, answers: input.answers, relationshipType: input.relationshipType });
    const all = [rep.intro.join(' '), rep.closing, ...rep.sections.flatMap((s) => [...s.body, ...(s.bullets ?? [])])].join(' ');
    expect(all).toContain('complicated'); // their one-word
    expect(all.toLowerCase()).toContain('surprise'); // surprise answer referenced
    expect(all).toContain('Ava'); // names personalized
    expect(all).toContain('Liam');
  });

  it('changes the written content with the FIRST funnel answer (relationship type)', () => {
    const gen = (rel: string) => {
      const { input, result } = make({ relationshipType: rel });
      return generateReport({ result, answers: input.answers, relationshipType: rel });
    };
    const crush = gen('crush');
    const married = gen('married');
    const ex = gen('ex');

    // Intros are type-specific
    expect(crush.intro[0]).toContain('crush you haven’t fully confessed');
    expect(married.intro[0]).toContain('already said “forever”');
    expect(ex.intro[0]).toContain('used to be yours');

    // The commitment premium chapter is renamed per type
    const title = (r: ReturnType<typeof gen>) => r.premiumSections.find((s) => s.id === 'marriage')!.title;
    expect(title(crush)).toBe('Could This Become Forever?');
    expect(title(married)).toBe('Recommitment & Forever Potential');
    expect(title(ex)).toBe('Reconciliation Potential');

    // Chapter bodies + advice + closing carry the type voice
    const soul = (r: ReturnType<typeof gen>) => r.sections.find((s) => s.id === 'soulmate')!.body.join(' ');
    expect(soul(crush)).toContain('before anything has even been said out loud');
    expect(soul(ex)).toContain('didn’t fully cut');
    const advice = (r: ReturnType<typeof gen>) => r.sections.find((s) => s.id === 'advice')!.bullets![0];
    expect(advice(crush)).not.toBe(advice(married));
    expect(crush.closing).not.toBe(married.closing);
  });

  it('uses zero gendered language for a same-gender couple (LGBTQ+ safe)', () => {
    const { result } = make({
      you: { name: 'Ava', gender: 'female', dob: '1996-05-10' },
      partner: { name: 'Mia', gender: 'female', dob: '1994-09-22' },
      relationshipType: 'partner',
    });
    const rep = generateReport({
      result,
      answers: { motivation: 'love', curiosity: 'future', importance: '5', oneword: 'passionate', destiny: 'absolutely', connection: 'often', surprise: 'soulmates' },
      relationshipType: 'partner',
    });
    const text = JSON.stringify(rep);
    // Names + they/them only — never assumes anyone's gender or roles.
    expect(text).not.toMatch(/\b(he|she|his|him|her|hers|himself|herself|husband|wife|boyfriend|girlfriend)\b/i);
    expect(text).toContain('Ava');
    expect(text).toContain('Mia');
  });

  it('situationship gets its own voice', () => {
    const { input, result } = make({ relationshipType: 'situationship' });
    const rep = generateReport({ result, answers: input.answers, relationshipType: 'situationship' });
    expect(rep.intro[0]).toContain('doesn’t have a name yet');
    expect(rep.premiumSections.find((s) => s.id === 'marriage')!.title).toBe('From “No Label” to Something Real');
    expect(rep.closing).toContain('🫧');
  });

  it('sells a stage-matched upsell package per relationship type', () => {
    const gen = (rel: string) => {
      const { input, result } = make({ relationshipType: rel });
      return generateReport({ result, answers: input.answers, relationshipType: rel });
    };
    const ids = (r: ReturnType<typeof gen>) => r.premiumSections.map((s) => s.id);

    // crush → Make-It-Happen Kit (conversation scripts, confession, signals…)
    const crush = gen('crush');
    expect(ids(crush)).toContain('conversation');
    expect(ids(crush)).toContain('confession');
    expect(ids(crush)).toContain('signs');

    // friend → Define kit with the Friends-to-Lovers roadmap
    const friend = gen('friend');
    expect(ids(friend)).toContain('dtr');
    const escalate = friend.premiumSections.find((s) => s.id === 'escalate')!;
    expect(escalate.title).toBe('The Friends-to-Lovers Roadmap');
    expect(escalate.headline).toContain('best-friend');

    // situationship → Define kit, "what are we?" script front and center
    const sit = gen('situationship');
    expect(ids(sit)).toContain('dtr');
    expect(ids(sit)).toContain('exclusive');

    // ex → Second-Chance Playbook
    const ex = gen('ex');
    expect(ids(ex)).toContain('shouldyou');
    expect(ids(ex)).toContain('firstmessage');
    expect(ids(ex)).toContain('closure');

    // married → classic Deep-Dive
    const married = gen('married');
    expect(ids(married)).toContain('dateideas');
    expect(ids(married)).toContain('conflict');

    // Every core chapter carries a stage-matched premium teaser
    for (const rep of [crush, friend, sit, ex, married]) {
      expect(rep.sections.every((s) => s.teaser && s.teaser.title.length > 0)).toBe(true);
    }
    // And the teasers point at DIFFERENT products per stage
    const soulTeaser = (r: ReturnType<typeof gen>) => r.sections.find((s) => s.id === 'soulmate')!.teaser!.title;
    expect(soulTeaser(crush)).not.toBe(soulTeaser(married));
  });

  it('generates cleanly for every relationship type (all 11) + unknown fallback', () => {
    const types = ['married', 'engaged', 'partner', 'situationship', 'crush', 'secret', 'like', 'friend', 'ex', 'future', 'curious', 'not-a-type', null];
    for (const rel of types) {
      const { input, result } = make({ relationshipType: rel as string | null });
      const rep = generateReport({ result, answers: input.answers, relationshipType: rel as string | null });
      expect(rep.sections).toHaveLength(8);
      expect(rep.premiumSections).toHaveLength(8);
      expect(rep.intro[0].length).toBeGreaterThan(40);
    }
  });

  it('works with completely missing answers (defaults)', () => {
    const { result } = make({ answers: {} });
    const rep = generateReport({ result, answers: {}, relationshipType: null });
    expect(rep.sections).toHaveLength(8);
    expect(rep.premiumSections).toHaveLength(8);
    expect(rep.intro[0].length).toBeGreaterThan(0);
  });
});

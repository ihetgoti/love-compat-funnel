import type { PersonProfile, ResultFlags, SubscoreKey, Highlight } from './types';
import { type RNG, pick } from './seededRandom';

export interface NarrativeCtx {
  you: PersonProfile;
  partner: PersonProfile;
  score: number;
  label: string;
  relationshipType: string | null;
  flags: ResultFlags;
}

function firstName(p: PersonProfile, fallback: string): string {
  const n = p.person.name?.trim().split(/\s+/)[0];
  return n || fallback;
}

const ELEMENT_WORD: Record<string, string> = {
  fire: 'fiery, electric',
  earth: 'grounded, sensual',
  air: 'playful, mind-to-mind',
  water: 'deep, soul-level',
};

export const SUBSCORE_META: Record<SubscoreKey, { label: string; icon: string }> = {
  soulmate: { label: 'Soulmate Potential', icon: '💞' },
  future: { label: 'Your Future Together', icon: '🔮' },
  chemistry: { label: 'Chemistry & Attraction', icon: '⚡' },
  communication: { label: 'Communication Style', icon: '💬' },
  growth: { label: 'Growth Areas', icon: '🌱' },
  emotional: { label: 'Emotional Connection', icon: '🫶' },
  longterm: { label: 'Long-Term Potential', icon: '🏡' },
};

export function taglineFor(ctx: NarrativeCtx, rng: RNG): string {
  const pool =
    ctx.score >= 90
      ? [
          'The kind of connection people write songs about.',
          'Two souls clearly pulling toward each other.',
          'This one’s rare — and the stars know it.',
        ]
      : ctx.score >= 80
        ? [
            'A genuinely beautiful match with real magic.',
            'Strong chemistry and even stronger potential.',
            'You two have something most people chase.',
          ]
        : [
            'A promising connection with room to bloom.',
            'Real potential — and a story still being written.',
            'A spark worth paying attention to.',
          ];
  return pick(rng, pool);
}

export function overviewFor(ctx: NarrativeCtx, rng: RNG): string {
  const Y = firstName(ctx.you, 'You');
  const P = firstName(ctx.partner, 'Them');
  const yEl = ctx.you.zodiac.element;
  const elementWord = ELEMENT_WORD[ctx.partner.zodiac.element] ?? ELEMENT_WORD[yEl];

  const intros = [
    `${P}’s ${ctx.partner.zodiac.name} heart and ${Y}’s ${ctx.you.zodiac.name} spirit create a ${elementWord} kind of chemistry.`,
    `When a ${ctx.you.archetype.short} like ${Y} meets a ${ctx.partner.archetype.short} like ${P}, something quietly powerful clicks into place.`,
    `${Y} and ${P} share a ${elementWord} bond that runs deeper than either of you might expect.`,
  ];
  const middles = [
    `Your energies don’t just match — they balance each other in the places that matter most.`,
    `There’s an ease here that most pairs spend years searching for.`,
    `You bring out a softer, braver version of one another.`,
  ];
  const ends = [
    `The full reading reveals exactly where your love is strongest — and the one place it’s ready to grow.`,
    `Below, you’ll see the hidden patterns shaping your connection right now.`,
    `What comes next might explain a few things you’ve always felt but never said out loud.`,
  ];
  return `${pick(rng, intros)} ${pick(rng, middles)} ${pick(rng, ends)}`;
}

export function adviceFor(ctx: NarrativeCtx, rng: RNG): string[] {
  const Y = firstName(ctx.you, 'You');
  const P = firstName(ctx.partner, 'them');
  const base = [
    `Lead with curiosity, not assumptions — ask ${P} the question you’ve been holding back.`,
    `${ctx.partner.archetype.short}s feel most loved through ${ctx.partner.archetype.loveLanguage.toLowerCase()}. Lean into that.`,
    `Protect your spark by keeping one ritual that’s just yours.`,
    `When tension rises, slow down before you speak — your bond rewards patience.`,
    `Say the soft thing out loud. ${P} is more receptive than you think.`,
    `Let ${Y} be seen too — vulnerability is your secret accelerant.`,
  ];
  return [pick(rng, base.slice(0, 2)), pick(rng, base.slice(2, 4)), pick(rng, base.slice(4))];
}

export function highlightsFor(ctx: NarrativeCtx, rng: RNG): Highlight[] {
  const superpowers = [
    'You make each other feel safe enough to be fully real.',
    'Your timing and instincts are uncannily in sync.',
    'You turn ordinary moments into ones you’ll both remember.',
  ];
  const secrets = [
    'A shared sense of humor that defuses almost anything.',
    'An emotional shorthand most couples never develop.',
    'A magnetic pull that keeps finding its way back.',
  ];
  const watch = [
    'Don’t mistake comfort for distance — keep reaching for each other.',
    'Give big feelings room to breathe instead of bottling them.',
    'Protect your time together from everything trying to steal it.',
  ];
  return [
    { icon: '🌟', title: 'Your Superpower', text: pick(rng, superpowers) },
    { icon: '🔑', title: 'Secret Strength', text: pick(rng, secrets) },
    { icon: '🌱', title: 'Gently Watch For', text: pick(rng, watch) },
  ];
}

export function subscoreCopy(
  key: SubscoreKey,
  score: number,
  ctx: NarrativeCtx,
): { teaser: string; detail: string } {
  const P = firstName(ctx.partner, 'them');
  const high = score >= 84;
  const map: Record<SubscoreKey, { teaser: string; detail: string }> = {
    soulmate: {
      teaser: high ? 'Unusually strong soul resonance ✨' : 'A real soul connection is forming',
      detail: high
        ? `The markers for a true soulmate bond are lighting up between you and ${P}. This is the rarest part of your reading.`
        : `There’s a genuine soul thread here with ${P} — the kind that strengthens the more you nurture it.`,
    },
    future: {
      teaser: high ? 'A bright, shared horizon 🔮' : 'A future worth building',
      detail: high
        ? `Your paths are pointing the same direction. The timeline ahead with ${P} looks remarkably aligned.`
        : `Your futures can weave together beautifully with a little intention — here’s where to focus first.`,
    },
    chemistry: {
      teaser: high ? 'Electric, undeniable pull ⚡' : 'A spark that’s clearly there',
      detail: high
        ? `The chemistry between you and ${P} is off the charts — magnetic, instinctive, and hard to ignore.`
        : `There’s real attraction here. With the right moments, that spark turns into a steady flame.`,
    },
    communication: {
      teaser: high ? 'You just *get* each other 💬' : 'Your styles can sync beautifully',
      detail: high
        ? `You and ${P} read each other with ease — even the silences say something.`
        : `Your communication styles differ just enough to keep things interesting — and that’s fixable into a real strength.`,
    },
    growth: {
      teaser: 'The one area ready to bloom 🌱',
      detail: `Every great love has a growing edge. Yours with ${P} is gentle and very workable — and naming it is half the magic.`,
    },
    emotional: {
      teaser: high ? 'Deep emotional safety 🫶' : 'A tender bond, deepening',
      detail: high
        ? `Emotionally, you’re a sanctuary for each other. That depth with ${P} is your foundation.`
        : `The emotional connection with ${P} is real and growing — small acts of openness accelerate it fast.`,
    },
    longterm: {
      teaser: high ? 'Built to go the distance 🏡' : 'Strong long-term foundations',
      detail: high
        ? `The ingredients for lasting love are all here. Long-term, you and ${P} have what it takes.`
        : `With care, this has staying power. Here’s what keeps you two strong for the long haul.`,
    },
  };
  return map[key];
}

/** Final headline label band from an overall score. Always warm. */
export function labelFor(score: number): string {
  if (score >= 92) return 'Rare Soulmate Connection';
  if (score >= 84) return 'Excellent Match';
  if (score >= 76) return 'Strong & Promising';
  if (score >= 68) return 'Growing Connection';
  return 'Worth Nurturing';
}

export type { ResultFlags };

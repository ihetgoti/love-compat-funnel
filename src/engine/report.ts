import type { CompatibilityResult, ResultFlags, SubscoreKey } from './types';
import { hashSeed, mulberry32, pick, type RNG } from './seededRandom';
import { getUpsellPack, stageForRelationship, type UpsellStage } from '@/content/offers';

/**
 * Post-paywall report content engine.
 *
 * Turns the quiz answers (motivation, curiosity, importance, one-word, destiny,
 * connection, surprise) — together with the deterministic compatibility result
 * (zodiac, archetype, score, subscores, flags) — into a fully personalized,
 * multi-section report. Every section is written FROM the user's answers, not
 * generic astrology. Deterministic and API-free: the same couple + answers
 * always produce the same report.
 */

/* --------------------------------- Types --------------------------------- */

export interface ReportSection {
  id: string;
  key?: SubscoreKey;
  title: string;
  icon: string;
  score?: number;
  headline: string; // one-line insight
  body: string[]; // 1–2 short paragraphs
  bullets?: string[];
  /** True for the section the user said they most wanted to discover. */
  starred?: boolean;
  premium?: boolean;
  /** Curiosity hook: the stage-matched premium chapter this one teases. */
  teaser?: { icon: string; title: string; headline: string };
}

export interface FullReport {
  title: string;
  subtitle: string;
  intro: string[];
  sections: ReportSection[]; // core (paid) sections, curiosity-focus first
  premiumSections: ReportSection[]; // upsell deep-dive
  closing: string;
}

export interface ReportInput {
  result: CompatibilityResult;
  answers: Record<string, string | string[]>;
  relationshipType: string | null;
}

/* --------------------------- Answer interpretation ------------------------ */

interface MotivationInfo {
  id: string;
  phrase: string;
  driver: 'love' | 'longing' | 'growth' | 'future' | 'curiosity';
}
interface WordInfo {
  id: string;
  adj: string;
  positive: boolean;
  note: string;
}
interface Insights {
  motivation: MotivationInfo;
  curiosityFocus: SubscoreKey;
  curiosityLabel: string;
  importance: number; // 1..5
  care: 'light' | 'meaningful' | 'everything';
  word: WordInfo;
  destinyBelieves: boolean;
  destinyLine: string;
  connectionFelt: number; // 0..2
  connectionLine: string;
  surprisePhrase: string;
  surpriseId: string;
}

const MOTIVATION: Record<string, MotivationInfo> = {
  love: { id: 'love', phrase: 'a deep, genuine love', driver: 'love' },
  cantstop: { id: 'cantstop', phrase: 'an almost magnetic pull toward them', driver: 'longing' },
  challenges: { id: 'challenges', phrase: 'an honest wish to understand what’s been hard', driver: 'growth' },
  future: { id: 'future', phrase: 'a longing to know where this is heading', driver: 'future' },
  curious: { id: 'curious', phrase: 'open, playful curiosity', driver: 'curiosity' },
};

const CURIOSITY: Record<string, { key: SubscoreKey; label: string }> = {
  soulmate: { key: 'soulmate', label: 'soulmate potential' },
  future: { key: 'future', label: 'your future together' },
  chemistry: { key: 'chemistry', label: 'your chemistry' },
  communication: { key: 'communication', label: 'how you communicate' },
  challenges: { key: 'growth', label: 'your hidden challenges' },
  emotional: { key: 'emotional', label: 'your emotional connection' },
};

const WORD: Record<string, WordInfo> = {
  magical: { id: 'magical', adj: 'magical', positive: true, note: 'that spark of the extraordinary' },
  exciting: { id: 'exciting', adj: 'exciting', positive: true, note: 'a live-wire, keep-you-guessing energy' },
  passionate: { id: 'passionate', adj: 'passionate', positive: true, note: 'real heat and intensity' },
  complicated: { id: 'complicated', adj: 'complicated', positive: false, note: 'layers you’re still untangling' },
  stable: { id: 'stable', adj: 'stable', positive: true, note: 'a steady, dependable foundation' },
  uncertain: { id: 'uncertain', adj: 'uncertain', positive: false, note: 'open questions you’re sitting with' },
};

const DESTINY: Record<string, { believes: boolean; line: string }> = {
  absolutely: {
    believes: true,
    line: 'You believe some relationships are written in the stars — and the markers here suggest yours may be one of them.',
  },
  maybe: {
    believes: true,
    line: 'You’re open to the idea of destiny, and there’s enough alignment here to keep that door wide open.',
  },
  notsure: {
    believes: false,
    line: 'You’re not sure destiny is real — so we’ll let the patterns speak for themselves, no faith required.',
  },
};

const CONNECTION: Record<string, { felt: number; line: string }> = {
  often: { felt: 2, line: 'You’ve felt an unusual connection with them again and again — and your energies confirm that’s no accident.' },
  sometimes: { felt: 1, line: 'You’ve felt flashes of an unusual connection — those moments are worth trusting more than you do.' },
  notyet: { felt: 0, line: 'You haven’t felt that unmistakable spark yet — but the raw ingredients for it are clearly here.' },
};

const SURPRISE: Record<string, string> = {
  soulmates: 'that you two are soulmates',
  perfect: 'that you’re a near-perfect match',
  challenges: 'that you have hidden challenges to grow through',
  meant: 'that you’re truly meant to be',
};

function first<T extends string | string[] | undefined>(v: T): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

function firstName(name: string | undefined, fallback: string): string {
  const n = (name ?? '').trim().split(/\s+/)[0];
  return n || fallback;
}

function interpret(answers: Record<string, string | string[]>): Insights {
  const motivation = MOTIVATION[first(answers.motivation)] ?? MOTIVATION.curious;
  const cur = CURIOSITY[first(answers.curiosity)] ?? CURIOSITY.soulmate;
  const importanceRaw = parseInt(first(answers.importance), 10);
  const importance = Number.isNaN(importanceRaw) ? 3 : Math.min(5, Math.max(1, importanceRaw));
  const word = WORD[first(answers.oneword)] ?? WORD.magical;
  const destiny = DESTINY[first(answers.destiny)] ?? DESTINY.maybe;
  const connection = CONNECTION[first(answers.connection)] ?? CONNECTION.sometimes;
  const surpriseId = first(answers.surprise) || 'meant';

  return {
    motivation,
    curiosityFocus: cur.key,
    curiosityLabel: cur.label,
    importance,
    care: importance >= 4 ? 'everything' : importance <= 2 ? 'light' : 'meaningful',
    word,
    destinyBelieves: destiny.believes,
    destinyLine: destiny.line,
    connectionFelt: connection.felt,
    connectionLine: connection.line,
    surprisePhrase: SURPRISE[surpriseId] ?? SURPRISE.meant,
    surpriseId,
  };
}

/* --------------------- Relationship-type content layer -------------------- */

/**
 * The FIRST funnel answer (who they're checking) reshapes the report's voice.
 * Each type gets its own framing woven into the intro, four chapters, the
 * advice list, the premium "marriage" chapter (title included) and the closing.
 */
interface RelCopy {
  /** "…you came here with X — about {stage}." */
  stage: string;
  soulmate: string;
  chemistry: string;
  future: string;
  longterm: string;
  /** Relationship-specific first advice bullet. */
  advice: string;
  marriageTitle: string;
  marriageLine: string;
  closing: string;
}

const REL_DEFAULT: RelCopy = {
  stage: 'someone your heart keeps circling back to',
  soulmate: 'Whatever label this connection wears, the soul-level markers underneath it are the part that doesn’t lie.',
  chemistry: 'Label aside, the pull between you two registers as unmistakably real.',
  future: 'Where this goes next is still unwritten — which means it’s still yours to write.',
  longterm: 'The long-term ingredients are here; what you name this connection matters far less than what you build with it.',
  advice: 'Be honest with yourself about what you want this to become — clarity attracts clarity.',
  marriageTitle: 'Marriage & Commitment Potential',
  marriageLine: 'Whatever stage you’re at today, this is the long arc your combined charts point toward.',
  closing: 'Wherever this goes next, you’re walking in with open eyes and a clear heart.',
};

const REL_COPY: Record<string, RelCopy> = {
  married: {
    stage: 'the person you already said “forever” to',
    soulmate: 'Years of shared mornings haven’t dulled the resonance — every chapter you’ve already lived together has reinforced the soul-thread, not worn it thin.',
    chemistry: 'Married chemistry changes shape: less fireworks-on-demand, more embers that reignite fast the moment you give them air. Yours still catch.',
    future: 'Your future isn’t a question of *if* — it’s a question of *what’s next*: the trip, the project, the next version of “us”.',
    longterm: 'You’re already living proof of this score. The reading simply confirms the foundation you stand on holds.',
    advice: 'Date your spouse again this month — one evening that has nothing to do with logistics, kids, or plans.',
    marriageTitle: 'Recommitment & Forever Potential',
    marriageLine: 'You already chose each other once. This chapter maps how to keep choosing each other — especially through the quiet seasons.',
    closing: 'Years in, and still curious about your love — that might be the most romantic thing of all. 💍',
  },
  engaged: {
    stage: 'the person you’re about to promise forever to',
    soulmate: 'The proposal already happened — this reading just confirms what your gut decided first.',
    chemistry: 'Engagement season can inflate or mask chemistry. Yours reads as the real thing, not just the excitement of the moment.',
    future: 'The next twelve months are the most formative of your entire story — you’re reading this at exactly the right time.',
    longterm: 'Everything in this reading is about to become the operating system of your marriage.',
    advice: 'Before the wedding, trade one fear and one dream each — out loud, no interruptions.',
    marriageTitle: 'Marriage Readiness',
    marriageLine: 'You’re counting down to vows — this is your readiness map: what’s already solid, and what to align before the big day.',
    closing: 'You said yes for a reason. The stars just co-signed it. 💍✨',
  },
  partner: {
    stage: 'the person you’re with',
    soulmate: 'You’re past the guessing stage — what this measures is whether “together” has the material to become “always”.',
    chemistry: 'Relationship chemistry is the kind that compounds: every shared ritual you two keep adds voltage instead of draining it.',
    future: 'The “where is this going?” question has a real answer in this reading — and it leans forward, not sideways.',
    longterm: 'You’ve already survived the hardest filter — choosing each other on ordinary days. That’s what this score is made of.',
    advice: 'Plan one “first” together this month — a first place, first dish, first anything. New memories are glue.',
    marriageTitle: 'Marriage & Commitment Potential',
    marriageLine: 'You’re past dating-for-fun; here’s how likely this becomes permanent — and exactly what strengthens the odds.',
    closing: 'You’re not just dating — you’re building. Keep going. 💕',
  },
  situationship: {
    stage: 'something real that doesn’t have a name yet',
    soulmate: 'No label doesn’t mean no depth — the resonance between you two is far more defined than your relationship status.',
    chemistry: 'Situationships run on chemistry, and it’s the one thing you two have never had to question. The reading agrees.',
    future: 'Every situationship eventually charges rent on ambiguity: it becomes something, or it quietly costs something. Yours has the alignment to genuinely become something.',
    longterm: 'Long-term needs definition to grow. The potential is all here — it’s waiting on a label brave enough to hold it.',
    advice: 'Ask the scary question — “what are we?” This reading suggests the answer is better than you fear.',
    marriageTitle: 'From “No Label” to Something Real',
    marriageLine: 'What actually happens if you two define this — the realistic arc from undefined to committed, mapped out.',
    closing: 'No label, but real feelings — maybe it’s time the name caught up with the truth. 🫧',
  },
  crush: {
    stage: 'a crush you haven’t fully confessed',
    soulmate: 'What’s remarkable: this much resonance exists before anything has even been said out loud.',
    chemistry: 'Crush chemistry is part projection, part signal — and yours carries far more signal than you think.',
    future: 'Every possible future in this chapter starts with the same first step: one brave sentence.',
    longterm: 'For this to become long-term it first has to become *real* — the potential is just waiting on your move.',
    advice: 'Stop rehearsing. Send the message, make the plan, say the thing — this reading says the odds are with you.',
    marriageTitle: 'Could This Become Forever?',
    marriageLine: 'Today it’s butterflies. This chapter sketches the long arc it could become — if you act on it.',
    closing: 'Some of the best love stories start exactly where you’re standing right now. Your move. 😍',
  },
  secret: {
    stage: 'a love story the world doesn’t know about yet',
    soulmate: 'Secrecy compresses everything into higher intensity — but the bond underneath yours reads as real, not just adrenaline.',
    chemistry: 'Hidden love runs hot. The reading separates the thrill of the secret from the pull between you — and both are genuinely strong.',
    future: 'Every secret love eventually reaches a fork: deeper hiding, or daylight. Your alignment suggests it would survive the light.',
    longterm: 'Long-term needs air to breathe. The foundation is here — the question is when you two decide to give it room.',
    advice: 'Decide *together* what the next chapter of privacy looks like — a secret is only heavy when it’s carried alone.',
    marriageTitle: 'When the Secret Meets Daylight',
    marriageLine: 'What happens to this bond when it goes public — and how to protect it through that transition.',
    closing: 'Your secret is safe here — and it’s built on something real. 🤫💖',
  },
  like: {
    stage: 'someone you like more than you’re admitting',
    soulmate: '“Someone I like” is doing a lot of quiet work in that sentence — the resonance here is bigger than the label.',
    chemistry: 'Early attraction is fragile data — except yours already shows the pattern that lasting chemistry starts with.',
    future: 'This is the chapter where “could be something” either gets its chance or stays a maybe. The reading favors giving it the chance.',
    longterm: 'Long-term is premature to promise — but the raw ingredients list is surprisingly complete.',
    advice: 'Create one unhurried moment together this week — and just notice how easy it feels.',
    marriageTitle: 'Could This Become Something?',
    marriageLine: 'From “I like them” to something with a name — the realistic path, step by step.',
    closing: '“Someone I like” is how every great “us” begins. 💖',
  },
  friend: {
    stage: 'a friendship that might be something more',
    soulmate: 'Friends-first bonds score high here for a reason: you’ve already passed the tests that strangers fail.',
    chemistry: 'This is the interesting chapter for friends — because your chemistry reading doesn’t look purely platonic.',
    future: 'Two futures exist here: a deeper friendship, or something braver. Both are good. One is bigger.',
    longterm: 'The best long-term partners describe each other the way you two already do: “my best friend.”',
    advice: 'Test the water gently — one slightly-more-than-friends moment, then watch how they respond.',
    marriageTitle: 'From Friends to Forever?',
    marriageLine: 'The friends-to-lovers arc has the highest long-term success pattern in this entire system. Here’s yours.',
    closing: 'The best partners are best friends first. You’re already halfway there. 👫',
  },
  ex: {
    stage: 'someone who used to be yours',
    soulmate: 'The thread between you didn’t fully cut — that’s why you’re here. This measures what’s actually still alive.',
    chemistry: 'Old flames keep real embers. This reading separates what’s nostalgia from what’s live current — and there’s live current.',
    future: 'A second chapter is possible — but only as a *new* story with new rules, never a rerun of the old one.',
    longterm: 'If you rebuild, you rebuild wiser: you already know exactly where the cracks were.',
    advice: 'Before reaching out, finish this sentence honestly: “This time, what would be different is…”',
    marriageTitle: 'Reconciliation Potential',
    marriageLine: 'What a second chapter would genuinely require — and whether the foundation you two had can support it.',
    closing: 'Whichever you choose — reunion or closure — you’ve earned the clarity you just got. 💔→💗',
  },
  future: {
    stage: 'the person you believe is your future',
    soulmate: 'You’re not asking “do we match” — you’re asking “is this the one.” The markers lean far enough toward yes to take seriously.',
    chemistry: 'When someone feels like the future, chemistry stops being a spark question and becomes a fuel question. You have fuel.',
    future: 'You came here for the long horizon, so treat this chapter as your centerpiece — it’s pointing where you hoped.',
    longterm: 'Belief plus foundation is rare. You brought the belief; the reading confirms the foundation.',
    advice: 'Start treating the future as a decision, not a lottery — take one concrete step toward it this month.',
    marriageTitle: 'Life-Partner Potential',
    marriageLine: 'You already suspect they’re the one. This chapter pressure-tests that instinct against everything in your charts.',
    closing: 'You already suspected they were your future. Now you know what to build it on. 🔮',
  },
  curious: {
    stage: 'someone you’re “just curious” about (sure 😉)',
    soulmate: 'For “just curious,” the universe returned some surprisingly serious numbers.',
    chemistry: 'Curiosity is chemistry’s favorite disguise — and this reading suggests yours isn’t idle.',
    future: 'Curiosity is how hearts ask permission. The door here is more open than you claimed at the start.',
    longterm: 'No pressure on forever — but if curiosity ever became commitment, the foundation would hold.',
    advice: 'Keep “just curious” as your cover story — but maybe test it with one real conversation.',
    marriageTitle: 'If Curiosity Became Commitment',
    marriageLine: 'Purely hypothetically, of course — here’s what the long game would look like for you two.',
    closing: 'You came curious. You’re leaving with something to think about. 👀💘',
  },
};

function relCopyFor(rel: string | null): RelCopy {
  return (rel && REL_COPY[rel]) || REL_DEFAULT;
}

/* ------------------------------- Build context ---------------------------- */

interface Ctx {
  youName: string;
  partnerName: string;
  youSign: string;
  partnerSign: string;
  youEl: string;
  partnerEl: string;
  sameEl: boolean;
  youArch: string;
  partnerArch: string;
  youLove: string;
  partnerLove: string;
  score: number;
  label: string;
  sub: Record<SubscoreKey, number>;
  flags: ResultFlags;
  rel: string | null;
  relCopy: RelCopy;
  ins: Insights;
}

function buildCtx(result: CompatibilityResult, ins: Insights, rel: string | null): Ctx {
  const you = result.you;
  const p = result.partner;
  const sub = Object.fromEntries(result.subscores.map((s) => [s.key, s.score])) as Record<
    SubscoreKey,
    number
  >;
  return {
    youName: firstName(you.person.name, 'You'),
    partnerName: firstName(p.person.name, 'Them'),
    youSign: you.zodiac.name,
    partnerSign: p.zodiac.name,
    youEl: you.zodiac.element,
    partnerEl: p.zodiac.element,
    sameEl: you.zodiac.element === p.zodiac.element,
    youArch: you.archetype.short,
    partnerArch: p.archetype.short,
    youLove: you.archetype.loveLanguage.toLowerCase(),
    partnerLove: p.archetype.loveLanguage.toLowerCase(),
    score: result.score,
    label: result.label,
    sub,
    flags: result.flags,
    rel,
    relCopy: relCopyFor(rel),
    ins,
  };
}

const careLine = (ctx: Ctx): string =>
  ctx.ins.care === 'everything'
    ? 'You told us this is just about everything to you — so we didn’t hold back.'
    : ctx.ins.care === 'light'
      ? 'You’re holding this lightly for now, which is a healthy, low-pressure place to explore from.'
      : 'This connection clearly means something real to you.';

/* ------------------------------ Core sections ----------------------------- */

function soulmate(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.soulmate;
  const { ins } = ctx;
  return {
    id: 'soulmate',
    key: 'soulmate',
    title: 'Soulmate Potential',
    icon: '💞',
    score: s,
    headline: s >= 88 ? 'The soulmate markers here are genuinely rare.' : 'A real soul-thread runs between you.',
    body: [
      `${ins.destinyLine} Between ${ctx.youName} and ${ctx.partnerName}, ${s >= 85 ? 'an unusually high' : 'a genuine'} share of the deeper soul-resonance indicators line up — the kind that show up in the relationships people describe as fated.`,
      `${ins.connectionLine} ${
        ins.motivation.driver === 'longing'
          ? 'That constant pull you feel toward them tends to point exactly here.'
          : `As a ${ctx.youArch} and a ${ctx.partnerArch}, you two form a pairing that often recognises itself fast.`
      }`,
    ],
    bullets: [
      `Soul-resonance score: ${s}%${s >= 88 ? ' — top tier' : ''}.`,
      ins.surpriseId === 'soulmates'
        ? 'You said learning you’re soulmates would surprise you most — the reading leans toward exactly that.'
        : pick(r, [
            'Trust the moments that feel “too easy.” They’re a signal, not luck.',
            'The déjà-vu moments between you are worth noticing — they cluster here.',
          ]),
    ],
  };
}

function chemistry(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.chemistry;
  const wordHeat = ctx.ins.word.id === 'passionate' || ctx.ins.word.id === 'exciting';
  return {
    id: 'chemistry',
    key: 'chemistry',
    title: 'Chemistry & Attraction',
    icon: '⚡',
    score: s,
    headline: s >= 85 ? 'The pull between you is electric.' : 'There’s a real spark here to build on.',
    body: [
      `${ctx.youSign} and ${ctx.partnerSign} ${ctx.sameEl ? `share the same ${ctx.youEl} element, which makes your chemistry feel instantly familiar` : `mix ${ctx.youEl} with ${ctx.partnerEl} — opposite enough to spark, close enough to catch`}. ${
        wordHeat
          ? `You called this “${ctx.ins.word.adj}” for a reason: ${ctx.ins.word.note} is written all over your dynamic.`
          : `Even though you described it as “${ctx.ins.word.adj},” the attraction indicators run warmer than you might expect.`
      }`,
      `${s >= 85 ? 'This is the kind of magnetism that doesn’t fade with familiarity.' : 'The spark is real — it just rewards a little intention to keep it lit.'} Physical and emotional attraction reinforce each other for you two rather than competing.`,
    ],
    bullets: [
      `Chemistry score: ${s}%.`,
      wordHeat ? 'Your challenge isn’t starting the fire — it’s not letting routine smother it.' : 'Novelty is your accelerant: new places, new firsts, keep the charge high.',
    ],
  };
}

function emotional(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.emotional;
  return {
    id: 'emotional',
    key: 'emotional',
    title: 'Emotional Connection',
    icon: '🫶',
    score: s,
    headline: s >= 84 ? 'Emotionally, you’re a safe harbour for each other.' : 'A tender bond that deepens with openness.',
    body: [
      `${ctx.ins.connectionLine} ${
        ctx.ins.connectionFelt >= 2
          ? 'That felt-sense of “getting” each other is your superpower.'
          : 'The capacity for that depth is here — it grows the moment either of you goes first.'
      }`,
      `A ${ctx.youArch} loves through ${ctx.youLove}; a ${ctx.partnerArch} through ${ctx.partnerName === 'Them' ? 'their own quiet language' : ctx.partnerLove}. ${
        ctx.youLove === ctx.partnerLove
          ? 'You speak the same emotional language, which makes feeling loved almost effortless.'
          : 'Your emotional languages differ just enough that naming them out loud unlocks a lot.'
      }`,
    ],
    bullets: [
      `Emotional-safety score: ${s}%.`,
      pick(r, [
        'Say the soft thing out loud within 24 hours of feeling it.',
        'Ask “what do you need right now — space or closeness?” It rarely misses.',
      ]),
    ],
  };
}

function communication(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.communication;
  return {
    id: 'communication',
    key: 'communication',
    title: 'Communication Style',
    icon: '💬',
    score: s,
    headline: s >= 84 ? 'You just get each other — even the silences.' : 'Two styles that sync beautifully with care.',
    body: [
      `${s >= 84 ? `${ctx.youName} and ${ctx.partnerName} read each other with ease; a glance often does what a paragraph can’t.` : `Your styles differ enough to spark the occasional cross-wire — which is fixable and, honestly, a strength once decoded.`} A ${ctx.youArch} and a ${ctx.partnerArch} tend to ${s >= 84 ? 'finish each other’s thoughts' : 'balance each other: one leads with feeling, the other with clarity'}.`,
      `Because you described this as “${ctx.ins.word.adj},” your best conversations happen when ${ctx.ins.word.positive ? 'you protect unhurried time to just talk' : 'you slow down and check the story you’re telling yourself before reacting'}.`,
    ],
    bullets: [
      `Communication score: ${s}%.`,
      pick(r, [
        'Replace “you always…” with “I felt… when…”. It changes everything.',
        'Repeat back what you heard before you respond. Watch tension drop.',
      ]),
    ],
  };
}

function future(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.future;
  const wantsFuture = ctx.ins.motivation.driver === 'future';
  return {
    id: 'future',
    key: 'future',
    title: 'Your Future Together',
    icon: '🔮',
    score: s,
    headline: s >= 84 ? 'Your paths are pointing the same direction.' : 'A future worth building — with intention.',
    body: [
      `${wantsFuture ? 'You came here to see where this is heading, so let’s be direct: ' : ''}${s >= 84 ? `the long-range alignment between ${ctx.youName} and ${ctx.partnerName} is strong. The milestones you’d each want tend to line up rather than collide.` : 'the pieces for a shared future are here; they just want a bit of deliberate steering.'}`,
      `${ctx.ins.care === 'everything' ? 'Given how much this matters to you, ' : ''}the next chapter rewards saying the quiet hopes out loud — the ones about where you’ll be a year from now.`,
    ],
    bullets: [
      `Future-alignment score: ${s}%.`,
      'Name one shared goal for the next 6 months. Shared direction beats grand promises.',
    ],
  };
}

function longterm(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.longterm;
  return {
    id: 'longterm',
    key: 'longterm',
    title: 'Long-Term Potential',
    icon: '🏡',
    score: s,
    headline: s >= 84 ? 'Built to go the distance.' : 'Strong long-term foundations to grow on.',
    body: [
      `${s >= 84 ? 'The staying-power ingredients — shared values, complementary rhythms, mutual respect — are all present.' : 'The foundation is solid; longevity here is a choice you get to keep making.'} You rated this a ${ctx.ins.importance}/5 in importance, which ${ctx.ins.importance >= 4 ? 'is exactly the kind of investment that turns potential into permanence' : 'leaves room to let it grow at its own pace'}.`,
      `${ctx.ins.destinyBelieves ? 'You believe in destiny — and long-term, this pairing gives that belief something to stand on.' : 'You don’t need to believe in fate for this to last; consistency will do the work belief usually gets credit for.'}`,
    ],
    bullets: [
      `Long-term score: ${s}%.`,
      'Protect one weekly ritual that’s just yours. Longevity is built in small repeats.',
    ],
  };
}

function growth(ctx: Ctx, r: RNG): ReportSection {
  const s = ctx.sub.growth;
  const complicated = ctx.ins.word.id === 'complicated' || ctx.ins.word.id === 'uncertain';
  return {
    id: 'growth',
    key: 'growth',
    title: 'Your Growth Area',
    icon: '🌱',
    score: s,
    headline: 'The one place ready to bloom.',
    body: [
      `Every great love has a growing edge, and yours is gentle and very workable. ${
        complicated
          ? `You already sense it — you called this “${ctx.ins.word.adj}.” That honesty is half the work done.`
          : `It’s not a red flag; it’s the muscle that, once you train it, makes everything else stronger.`
      }`,
      `${
        ctx.ins.surpriseId === 'challenges'
          ? 'You said discovering hidden challenges would surprise you most — so consider this your gentle heads-up, framed as opportunity, not warning.'
          : 'For you two, growth lives in patience: slowing down before reacting, and choosing curiosity over assumption.'
      }`,
    ],
    bullets: [
      `Growth-area score: ${s}% (the room you have to rise).`,
      'When friction shows up, ask “what’s this trying to teach us?” before “who’s right?”.',
    ],
  };
}

function advice(ctx: Ctx, r: RNG): ReportSection {
  const { ins } = ctx;
  const bullets: string[] = [];
  bullets.push(
    ins.motivation.driver === 'love'
      ? `Because you truly love ${ctx.partnerName}, let them see it in action this week — not just words, but one thing they’d never expect.`
      : ins.motivation.driver === 'longing'
        ? `That pull you feel toward ${ctx.partnerName} is data. Stop waiting for the “right moment” to act on it.`
        : ins.motivation.driver === 'growth'
          ? 'Name the hard thing kindly and early. The challenges you sense shrink the moment they’re spoken.'
          : ins.motivation.driver === 'future'
            ? `Ask ${ctx.partnerName} the “where do you see us?” question. You came for the future — go get it.`
            : `Stay curious out loud. A single honest question can turn “just checking” into something real.`,
  );
  bullets.push(
    `Love ${ctx.partnerName} in their language — lean into ${ctx.partnerLove}. It lands harder than your default.`,
  );
  bullets.push(
    ins.word.positive
      ? `Protect what makes this “${ins.word.adj}.” Put one ritual on the calendar that guards it.`
      : `Turn “${ins.word.adj}” into “clear.” One honest conversation does more than a month of guessing.`,
  );
  bullets.push(
    ins.connectionFelt >= 2
      ? 'Tell them about the connection you feel. Naming it invites them to meet you in it.'
      : 'Create the conditions for connection: fewer screens, more unhurried presence.',
  );
  bullets.push('When tension rises, slow down before you speak — your bond rewards patience over speed.');

  return {
    id: 'advice',
    title: 'Personalized Advice',
    icon: '💌',
    headline: 'Five moves, written for the two of you.',
    body: [
      `${ctx.youName}, these aren’t generic tips — each one is drawn from what you told us about ${ctx.partnerName} and how you two work.`,
    ],
    bullets,
  };
}

/* ----------------------------- Premium sections --------------------------- */

interface PremiumDef {
  id: string;
  title: string;
  icon: string;
  build: (ctx: Ctx, r: RNG) => { headline: string; body: string[]; bullets?: string[] };
}

const PREMIUM: PremiumDef[] = [
  {
    id: 'forecast',
    title: '12-Month Love Forecast',
    icon: '🔮',
    build: (ctx) => ({
      headline: 'The next year, month by month.',
      body: [
        `Your ${ctx.score}% ${ctx.label.toLowerCase()} sets a warm baseline for the year. Expect an early window where ${ctx.ins.word.positive ? `the “${ctx.ins.word.adj}” feeling intensifies` : 'clarity finally starts to replace the guesswork'}, followed by a deepening phase where routine either strengthens or tests you.`,
      ],
      bullets: [
        'Q1: momentum & firsts — say yes to new experiences together.',
        'Q2: the “real life” test — small consistency matters most.',
        `Q3: a closeness spike${ctx.ins.importance >= 4 ? ' worth planning something meaningful around' : ''}.`,
        'Q4: reflection & recommitment — revisit the goal you set.',
      ],
    }),
  },
  {
    id: 'marriage',
    title: 'Marriage & Commitment Potential',
    icon: '💍',
    build: (ctx) => ({
      headline: ctx.sub.longterm >= 82 ? 'The commitment signals are strong.' : 'Commitment is a very reachable next step.',
      body: [
        `With a long-term score of ${ctx.sub.longterm}% and destiny ${ctx.ins.destinyBelieves ? 'firmly on your radar' : 'left aside in favour of evidence'}, ${ctx.youName} and ${ctx.partnerName} have ${ctx.sub.longterm >= 82 ? 'the raw material for a lasting commitment' : 'a foundation that deepens into commitment with intention'}.`,
      ],
      bullets: [
        'What strengthens it: aligned rituals, shared money values, repair after conflict.',
        `What to watch: letting “${ctx.ins.word.adj}” go unspoken instead of defined.`,
      ],
    }),
  },
  {
    id: 'intimacy',
    title: 'Intimacy Compatibility',
    icon: '🔥',
    build: (ctx) => ({
      headline: ctx.sub.chemistry >= 84 ? 'Deep physical & emotional chemistry.' : 'Intimacy that grows with trust.',
      body: [
        `Your chemistry (${ctx.sub.chemistry}%) and emotional safety (${ctx.sub.emotional}%) feed each other. ${ctx.sub.chemistry >= 84 ? 'Desire and closeness reinforce rather than compete for you two.' : 'The more emotionally safe you feel, the more the physical spark follows — that’s your sequence.'}`,
      ],
      bullets: [
        ctx.sub.emotional >= ctx.sub.chemistry ? 'Lead with emotional closeness; physical follows for you.' : 'Physical closeness opens the emotional door — use it as a bridge, not a substitute.',
        'Name what you each enjoy out loud. Assumption is intimacy’s quiet killer.',
      ],
    }),
  },
  {
    id: 'blueprint',
    title: 'Relationship Blueprint',
    icon: '🗺️',
    build: (ctx) => ({
      headline: 'Your step-by-step plan.',
      body: [
        `A ${ctx.youArch}–${ctx.partnerArch} pairing thrives on a simple rhythm: connect, adventure, repair, repeat. Given you care about this ${ctx.ins.care === 'everything' ? 'more than almost anything' : ctx.ins.care === 'light' ? 'in a relaxed, curious way' : 'a real amount'}, keep the plan light but consistent.`,
      ],
      bullets: [
        'Weekly: one unhurried check-in with no phones.',
        'Monthly: one new shared experience.',
        'Always: repair fast, keep score of the good stuff.',
      ],
    }),
  },
  {
    id: 'emotionalgrowth',
    title: 'Emotional Growth Plan',
    icon: '💞',
    build: (ctx) => ({
      headline: 'Grow closer, faster — together.',
      body: [
        `Your growth edge (${ctx.sub.growth}%) is the muscle to train. ${ctx.ins.connectionFelt >= 2 ? 'You already feel the connection; the work is trusting it enough to be vulnerable first.' : 'The work is creating the safety that lets connection deepen on its own.'}`,
      ],
      bullets: [
        'Practice “first-vulnerability”: share the feeling before you’re sure it’s safe.',
        'Celebrate repair, not just harmony — bouncing back is the real skill.',
      ],
    }),
  },
  {
    id: 'conflict',
    title: 'Conflict Resolution Guide',
    icon: '🎯',
    build: (ctx) => ({
      headline: 'Turn friction into closeness.',
      body: [
        `${ctx.sub.communication >= 82 ? 'You communicate well, so conflicts are usually about timing and tone, not substance.' : 'Most of your friction is a style mismatch, not a values clash — which makes it very solvable.'} The pattern to break: reacting to the story in your head instead of the person in front of you.`,
      ],
      bullets: [
        'Rule 1: no big talks when either of you is hungry, tired, or rushed.',
        'Rule 2: one speaks, one reflects back — then switch. No interrupting.',
        'Rule 3: end every repair by naming one thing you appreciate.',
      ],
    }),
  },
  {
    id: 'dateideas',
    title: '50 Date Ideas For Your Match',
    icon: '🌹',
    build: (ctx) => ({
      headline: `Hand-picked for a ${ctx.youArch} & a ${ctx.partnerArch}.`,
      body: [
        `Because you called this “${ctx.ins.word.adj},” your best dates ${ctx.ins.word.positive ? 'amplify that feeling' : 'gently create ease and lightness'}. ${ctx.sameEl ? `Two ${ctx.youEl} souls love shared-immersion dates.` : `A ${ctx.youEl}–${ctx.partnerEl} pair loves a mix of cozy and adventurous.`}`,
      ],
      bullets: [
        ctx.sub.chemistry >= 84 ? 'Adventure tier: spontaneous road trip, dancing, cooking something new.' : 'Warm-up tier: long walks, a shared playlist, a “firsts” night.',
        'Deep tier: sunrise talk, write each other a letter, plan a someday trip.',
        'Everyday tier: phone-free dinner, stargazing, a standing weekly ritual.',
      ],
    }),
  },
  {
    id: 'communicationguide',
    title: 'Deep Communication Guide',
    icon: '🗝️',
    build: (ctx) => ({
      headline: 'Say the hard things — the right way.',
      body: [
        `A ${ctx.youArch} and a ${ctx.partnerArch} unlock each other with different keys. Yours is ${ctx.youLove}; theirs is ${ctx.partnerLove}. Speak to their key, and even hard conversations land soft.`,
      ],
      bullets: [
        'Open hard talks with appreciation, not accusation.',
        'Use “I feel… when… because…”. Specific beats sweeping.',
        'Schedule a monthly “state of us” — 20 minutes, no defensiveness.',
      ],
    }),
  },
];

/* --------------- Stage-specific premium builders (spark/define/rekindle) ---------------
   The upsell PRODUCT changes with the first funnel answer: crush-stage buyers get
   conversation scripts, situationship/friend buyers get a define-the-relationship
   kit, exes get a second-chance playbook. Committed types keep the deep-dive. */

type PremiumContent = { headline: string; body: string[]; bullets?: string[] };

const EXTRA_BUILDERS: Record<string, (ctx: Ctx, r: RNG) => PremiumContent> = {
  /* ------------ SPARK · crush / like / curious — “Make-It-Happen Kit” ------------ */
  conversation: (ctx) => ({
    headline: `Openers a ${ctx.partnerArch} actually responds to.`,
    body: [
      `${ctx.partnerName}’s type opens up through ${ctx.partnerLove} — the best openers make them feel *seen*, not performed at. As a ${ctx.youArch}, your natural voice is already the asset; you just need to aim it.`,
    ],
    bullets: [
      `The callback: resurface a small detail from your last talk — “I kept thinking about what you said about…”. Instant “they remember me” glow.`,
      `The curiosity opener: “Okay, random question…” — a ${ctx.partnerSign}’s energy can’t resist an open loop.`,
      `The shared-world opener: react to something in their world with a question, never just a compliment.`,
    ],
  }),
  signs: (ctx) => ({
    headline: `The interest signals a ${ctx.partnerSign} can’t hide.`,
    body: [
      `With your chemistry reading at ${ctx.sub.chemistry}%, the question isn’t whether there’s a spark — it’s whether ${ctx.partnerName} is showing theirs in ways you’ve been missing.`,
    ],
    bullets: [
      'Reply-effort mirroring: their messages match or exceed the energy of yours.',
      `They remember your small details — and bring them up unprompted.`,
      'They extend conversations they could easily end. That’s choice, not politeness.',
      'The orbit: they keep finding low-stakes reasons to be near you.',
    ],
  }),
  confession: (ctx) => ({
    headline: 'The 3-sentence confession that lands soft.',
    body: [
      `${ctx.ins.connectionFelt >= 2 ? 'You’ve felt the pull again and again — waiting longer doesn’t add safety, it just adds pressure.' : 'You don’t need certainty to speak — you need honesty and an exit ramp for both of you.'} Here’s the script, tuned for a ${ctx.partnerArch}.`,
    ],
    bullets: [
      'Sentence 1 — name the moment: “I keep almost saying this, so I’m just going to say it.”',
      `Sentence 2 — say it plainly: “I like you, ${ctx.partnerName} — more than I’ve let on.”`,
      'Sentence 3 — give an out: “No pressure at all. I just didn’t want to keep it from you.”',
      'Timing: at the end of a good moment together. Never mid-crisis, and face-to-face beats text.',
    ],
  }),
  texting: (ctx) => ({
    headline: 'Keep the charge alive between meetings.',
    body: [
      `${ctx.sameEl ? `Two ${ctx.youEl} souls text in the same rhythm — your risk is comfort, not silence.` : `A ${ctx.youEl}–${ctx.partnerEl} pairing texts on different clocks — decode the pace before you judge the interest.`}`,
    ],
    bullets: [
      'Mirror their pace for a week — then lead once: “this made me think of you.”',
      'One open loop per conversation: end on something unfinished.',
      'Ask questions that can’t be answered with “lol.”',
    ],
  }),
  firstdate: (ctx) => ({
    headline: `A first date built for a ${ctx.youEl}–${ctx.partnerEl} pairing.`,
    body: [
      `${ctx.sameEl ? `Shared-element pairs shine in immersion — one experience you’re both inside of beats sitting opposite each other.` : `Your mixed elements want contrast: somewhere with energy, then somewhere quiet enough to actually talk.`}`,
    ],
    bullets: [
      'Pick a place with built-in things to react to — a market, a show, street food. Reactions create chemistry.',
      'Plan a walk after: transitions are where the real conversation happens.',
      'Have an exit *and* an extend option, so nothing ever feels forced.',
    ],
  }),
  confidence: (ctx) => ({
    headline: 'Walk in calm — whatever happens.',
    body: [
      `The reframe: a ${ctx.score}% reading means the connection is real. A confession only reveals *timing* — it can’t create or destroy compatibility.`,
    ],
    bullets: [
      'A no is a verdict on timing, never on your worth.',
      'Make an “either way” plan: decide what you’ll do that same evening regardless of the answer.',
      'Confidence tell: slow everything by 10%. Rushing reads as fear.',
    ],
  }),
  forecast90: (ctx) => ({
    headline: 'Three windows, ninety days.',
    body: [
      `Momentum is on your side right now — the reading’s alignment is a moving window, and waiting flattens it.`,
    ],
    bullets: [
      'Days 1–30 · Momentum: create two real interactions a week. Presence beats strategy.',
      `Days 31–60 · The decision window: this is where the brave conversation belongs${ctx.ins.importance >= 4 ? ' — and you already told us how much this matters' : ''}.`,
      'Days 61–90 · Definition: whatever was said, make it real — a plan, a label, a rhythm.',
    ],
  }),

  /* --------- DEFINE · situationship / secret / friend — “Define-It Kit” --------- */
  dtr: (ctx) => ({
    headline: 'Word-for-word, panic-free.',
    body: [
      `The “what are we?” talk fails as an ambush and works as an invitation — especially with a ${ctx.partnerArch}, who answers best when nothing is being demanded.`,
    ],
    bullets: [
      'Open: “I like what we have — and I’ve stopped pretending I don’t wonder what it is.”',
      'Middle: “I’m not asking for a speech. Just… where’s your head?”',
      'Close: don’t negotiate in the moment. “Okay — let’s both sit with that.” Calm is magnetic.',
    ],
  }),
  escalate: (ctx) => ({
    headline:
      ctx.rel === 'friend'
        ? 'From best-friend-safe to something braver.'
        : 'More, without breaking what already works.',
    body: [
      `${ctx.rel === 'friend' ? 'Friends-to-lovers is the highest-success arc in this entire system — because the foundation is already load-tested.' : 'The in-between survives escalation better than you fear — the reading shows the base is solid enough to build on.'} Move in stages, and read the response at each one.`,
    ],
    bullets: [
      'Stage 1 — micro-shifts: longer eye contact, sitting closer, small touches at natural moments.',
      'Stage 2 — the test balloon: “this kind of feels like a date” — said with a smile. Their reaction is your data.',
      'Stage 3 — name it (use the script chapter).',
      'Stage 4 — protect the base: whatever happens, do a completely normal hangout within the week.',
    ],
  }),
  signals: (ctx) => ({
    headline: 'What they want vs. what they say.',
    body: [
      `In undefined territory, actions outrank words ten to one. Your emotional line reads ${ctx.sub.emotional}% — the feeling is likely there; the courage might be what’s lagging.`,
    ],
    bullets: [
      'Green: future-tense language — they plan things with you weeks out.',
      'Amber: intense in private, vague in public. That’s a courage gap, not a feeling gap.',
      'Red: they only reach out on their own schedule. Guard your energy accordingly.',
    ],
  }),
  exclusive: (ctx) => ({
    headline: 'When — and how — to ask for more.',
    body: [
      `${ctx.ins.importance >= 4 ? 'You rated this near the top of what matters to you, so halfway will quietly cost you.' : 'Even held lightly, ambiguity has a shelf life.'} The exclusivity talk is a preference statement, not an ultimatum.`,
    ],
    bullets: [
      'Earn the moment: two consistent months beats one intense week.',
      'Frame it as you, not them: “I’m not built for halfway — and I don’t want halfway with you.”',
      'If the answer is “maybe”, set a private deadline. Maybe has an expiry date.',
    ],
  }),
  boundaries: (ctx) => ({
    headline: 'Protect your heart while it’s undefined.',
    body: [
      `The in-between is only romantic while it’s *moving*. ${ctx.ins.word.positive ? 'Keep it moving and it stays magic.' : `You called this “${ctx.ins.word.adj}” — that’s your heart asking for structure.`}`,
    ],
    bullets: [
      'Decide your non-negotiables alone, before any conversation.',
      'Don’t pause your life as a deposit on their potential.',
      'Monthly check: is this still a choice — or has it become a habit?',
    ],
  }),

  /* ----------------- REKINDLE · ex — “Second-Chance Playbook” ----------------- */
  shouldyou: (ctx) => ({
    headline:
      ctx.score >= 84 ? 'The honest answer: the foundation deserves a second look.' : 'The honest answer: possible — with guardrails.',
    body: [
      `Stripped of nostalgia, the underlying compatibility between ${ctx.youName} and ${ctx.partnerName} reads ${ctx.score}%. What ended it was more likely the *pattern* than the match — your growth-area reading (${ctx.sub.growth}%) says the repairable kind.`,
    ],
    bullets: [
      'Reach out if: you can name, specifically, what you would do differently.',
      'Don’t if: you mostly miss being un-lonely. That’s a need, not a person.',
      'The test: would you choose them if you met them today, exactly as they are now?',
    ],
  }),
  firstmessage: () => ({
    headline: 'Low stakes, zero pressure, one question.',
    body: [
      'The first message has exactly one job: open a door. Not relitigate the past, not confess, not explain.',
    ],
    bullets: [
      'Send: “Saw [neutral good-memory thing] and thought of you. Hope life’s treating you well — how have you been?”',
      'Never send: essays, apologies-in-advance, “I’ve changed,” or anything after midnight.',
      'One message. If nothing comes back, the silence *is* the answer — and it still counts as closure.',
    ],
  }),
  whatbroke: (ctx) => ({
    headline: 'The real pattern, named.',
    body: [
      `You described this as “${ctx.ins.word.adj}.” Underneath, the charts point at a repairable pattern rather than a broken match — timing and communication style likely did more damage than actual incompatibility.`,
    ],
    bullets: [
      'Usually fixable: rhythm mismatches, unspoken expectations, outside pressure.',
      'Not fixable by wanting: a values conflict, or one-sided effort. Be honest about which yours was.',
    ],
  }),
  newrules: (ctx) => ({
    headline: 'Round two only works as a new story.',
    body: [
      `${ctx.youName} + ${ctx.partnerName} 2.0 needs different physics — the same inputs will produce the same ending.`,
    ],
    bullets: [
      'Rule 1: the old fight is banned — the theme, not just the words.',
      'Rule 2: new rituals, new places. Don’t rebuild on haunted ground.',
      'Rule 3: a three-month honest review — both of you, out loud.',
    ],
  }),
  trust: () => ({
    headline: 'Week by week, realistically.',
    body: ['Trust rebuilds on boring consistency, not grand gestures.'],
    bullets: [
      'Weeks 1–2: low-stakes reliability — do small things exactly when you said you would.',
      'Weeks 3–6: first vulnerability re-exchange. Keep it small; let it land.',
      'Month 2+: revisit the hard topic once, under the new rules. If it holds, it holds.',
    ],
  }),
  closure: () => ({
    headline: 'If you choose to walk away — walk away whole.',
    body: [
      'A second chance isn’t owed to anyone, including your past self. Closure is something you give yourself; nobody hands it over.',
    ],
    bullets: [
      'Write the letter you’ll never send — all of it.',
      'Name three things that love taught you that the next one gets for free.',
      'End with one physical act: delete the thread, return the hoodie, book the trip.',
    ],
  }),
};

/** Every premium chapter builder, addressable by pack section id. */
const BUILDER_BY_ID: Record<string, (ctx: Ctx, r: RNG) => PremiumContent> = {
  ...Object.fromEntries(PREMIUM.map((p) => [p.id, p.build])),
  ...EXTRA_BUILDERS,
};

/** Which premium chapter each core chapter teases, per stage. */
const TEASER_BY_STAGE: Record<UpsellStage, Record<string, string>> = {
  spark: { soulmate: 'confession', chemistry: 'texting', emotional: 'signs', communication: 'conversation', future: 'firstdate', longterm: 'marriage', growth: 'confidence', advice: 'forecast90' },
  define: { soulmate: 'marriage', chemistry: 'intimacy', emotional: 'signals', communication: 'dtr', future: 'forecast90', longterm: 'escalate', growth: 'boundaries', advice: 'exclusive' },
  committed: { soulmate: 'marriage', chemistry: 'intimacy', emotional: 'emotionalgrowth', communication: 'communicationguide', future: 'forecast', longterm: 'blueprint', growth: 'conflict', advice: 'dateideas' },
  rekindle: { soulmate: 'shouldyou', chemistry: 'firstmessage', emotional: 'trust', communication: 'newrules', future: 'forecast90', longterm: 'marriage', growth: 'whatbroke', advice: 'closure' },
};

/* -------------------------------- Assembly -------------------------------- */

function buildIntro(ctx: Ctx): string[] {
  const { ins } = ctx;
  return [
    `${ctx.youName}, you came here with ${ins.motivation.phrase} — about ${ctx.relCopy.stage}. ${careLine(ctx)} You described what’s between you and ${ctx.partnerName} in a single word — “${ins.word.adj}” — ${ins.word.note}. Hold onto that word; it threads through everything below.`,
    `Your headline result is a ${ctx.score}% ${ctx.label}. ${ins.destinyLine} And the thing you said would surprise you most — ${ins.surprisePhrase} — is exactly what this report opens with.`,
  ];
}

function buildClosing(ctx: Ctx): string {
  return `${ctx.youName} & ${ctx.partnerName}, a ${ctx.score}% ${ctx.label.toLowerCase()} is a beautiful place to stand. Whatever “${ctx.ins.word.adj}” becomes next, you now know exactly where your strengths are — and the one place worth a little tenderness. ${ctx.relCopy.closing} 💞`;
}

const CORE_BUILDERS: Array<{ id: string; fn: (ctx: Ctx, r: RNG) => ReportSection }> = [
  { id: 'soulmate', fn: soulmate },
  { id: 'chemistry', fn: chemistry },
  { id: 'emotional', fn: emotional },
  { id: 'communication', fn: communication },
  { id: 'future', fn: future },
  { id: 'longterm', fn: longterm },
  { id: 'growth', fn: growth },
  { id: 'advice', fn: advice },
];

/** Generate the full, answer-driven post-paywall report. Deterministic. */
export function generateReport(input: ReportInput): FullReport {
  const ins = interpret(input.answers);
  const ctx = buildCtx(input.result, ins, input.relationshipType);
  const seed = input.result.seed;
  const rngFor = (id: string): RNG => mulberry32(hashSeed(seed, 'report', id));

  let sections = CORE_BUILDERS.map((b) => b.fn(ctx, rngFor(b.id)));

  // Relationship-type layer: the FIRST funnel answer reshapes chapter bodies
  // and puts a type-specific action at the top of the advice list.
  const relAug: Partial<Record<string, string>> = {
    soulmate: ctx.relCopy.soulmate,
    chemistry: ctx.relCopy.chemistry,
    future: ctx.relCopy.future,
    longterm: ctx.relCopy.longterm,
  };
  sections = sections.map((s) => {
    const extra = relAug[s.id];
    let out = extra ? { ...s, body: [...s.body, extra] } : s;
    if (s.id === 'advice') out = { ...out, bullets: [ctx.relCopy.advice, ...(out.bullets ?? [])] };
    return out;
  });

  // Hoist + star the section the user said they most wanted to discover.
  const focus = ins.curiosityFocus;
  sections = sections.map((s) => (s.key === focus ? { ...s, starred: true } : s));
  const hoisted = [
    ...sections.filter((s) => s.key === focus),
    ...sections.filter((s) => s.key !== focus),
  ];

  // The upsell PRODUCT is stage-matched to the first funnel answer:
  // spark (crush/like/curious) · define (situationship/secret/friend) ·
  // committed (partner/engaged/married/future) · rekindle (ex).
  const stage = stageForRelationship(input.relationshipType);
  const pack = getUpsellPack(input.relationshipType);
  const premiumSections: ReportSection[] = pack.sections.map((ps) => {
    const build = BUILDER_BY_ID[ps.id];
    const c: PremiumContent = build
      ? build(ctx, rngFor(ps.id))
      : { headline: ps.text, body: [ps.text] };
    const sec: ReportSection = { id: ps.id, title: ps.title, icon: ps.icon, premium: true, ...c };
    // The commitment chapter is renamed + reframed by relationship type
    // (ex → Reconciliation Potential, crush → Could This Become Forever?, …).
    if (ps.id === 'marriage') {
      sec.title = ctx.relCopy.marriageTitle;
      sec.body = [...sec.body, ctx.relCopy.marriageLine];
    }
    return sec;
  });

  // Attach each core chapter's stage-matched premium teaser (curiosity hooks).
  const teaserMap = TEASER_BY_STAGE[stage];
  const withTeasers = hoisted.map((s) => {
    const p = premiumSections.find((x) => x.id === teaserMap[s.id]);
    return p ? { ...s, teaser: { icon: p.icon, title: p.title, headline: p.headline } } : s;
  });

  return {
    title: 'Your Full Love Report',
    subtitle: `${ctx.youName} & ${ctx.partnerName} · ${ctx.score}% ${ctx.label}`,
    intro: buildIntro(ctx),
    sections: withTeasers,
    premiumSections,
    closing: buildClosing(ctx),
  };
}

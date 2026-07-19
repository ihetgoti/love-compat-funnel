export interface Offer {
  id: string;
  name: string;
  price: number;
  compareAt: number;
  badge: string;
}

export interface OfferFeature {
  icon: string;
  text: string;
}

import { PRICING, UPSELL_MULTIPLIER } from './pricing';

/**
 * Two-tier paywall.
 *  - The "small report" (first paywall) is intentionally cheap.
 *  - The premium upsell is exactly 10× the small report price in EVERY market.
 * Per-country amounts live in `pricing.ts` (PPP-adjusted, India-first). The
 * constants below are the USD baseline kept for anywhere that needs a number
 * without a market context (tests, fallbacks).
 */
export { UPSELL_MULTIPLIER };
export const SMALL_REPORT_PRICE = PRICING.US.micro;
export const UPSELL_PRICE = PRICING.US.upsell;

/** The cheap "small report" — unlocks your core compatibility reading. */
export const MICRO_OFFER: Offer & { features: OfferFeature[] } = {
  id: 'small-report',
  name: 'Your Compatibility Report',
  price: SMALL_REPORT_PRICE,
  compareAt: 19,
  badge: 'TODAY ONLY',
  features: [
    { icon: '💞', text: 'Soulmate Potential — your rarest score, revealed' },
    { icon: '🔮', text: 'Your Future Together forecast' },
    { icon: '⚡', text: 'Chemistry & attraction breakdown' },
    { icon: '💬', text: 'Communication compatibility' },
    { icon: '🫶', text: 'Emotional connection depth' },
    { icon: '🌱', text: 'Your #1 growth area — and how to heal it' },
    { icon: '🏡', text: 'Long-term potential rating' },
    { icon: '💌', text: 'Personalized advice, just for you two' },
  ],
};

export interface UpsellSection {
  id: string;
  icon: string;
  title: string;
  text: string;
}

/**
 * Stage-matched upsell packages.
 *
 * The FIRST funnel answer decides WHAT we sell them: someone with a crush
 * doesn't need a marriage blueprint — they need conversation scripts. Four
 * packages, same price (always 10× micro), same 8-chapter structure, but the
 * product matches their actual situation. The backend report engine generates
 * the chapter contents for whichever pack applies.
 */
export type UpsellStage = 'spark' | 'define' | 'committed' | 'rekindle';

const STAGE_BY_REL: Record<string, UpsellStage> = {
  crush: 'spark', like: 'spark', curious: 'spark',
  situationship: 'define', secret: 'define', friend: 'define',
  partner: 'committed', engaged: 'committed', married: 'committed', future: 'committed',
  ex: 'rekindle',
};

export function stageForRelationship(rel: string | null | undefined): UpsellStage {
  return (rel && STAGE_BY_REL[rel]) || 'committed';
}

export interface UpsellPack {
  stage: UpsellStage;
  name: string;
  tagline: string;
  badge: string;
  sections: UpsellSection[]; // exactly 8, ids consumed by the backend generator
}

export const UPSELL_PACKS: Record<UpsellStage, UpsellPack> = {
  spark: {
    stage: 'spark',
    name: 'The Make-It-Happen Kit',
    tagline: 'From secret feelings to a real first chapter — scripts included.',
    badge: 'ONE-TIME OFFER',
    sections: [
      { id: 'conversation', icon: '💬', title: 'Conversation Starters That Work On Them', text: 'Openers matched to their exact archetype.' },
      { id: 'signs', icon: '🔍', title: 'Do They Like You Back? Signal Decoder', text: 'The signals their type can’t hide.' },
      { id: 'confession', icon: '💘', title: 'How (and When) to Tell Them', text: 'A 3-sentence script that lands soft.' },
      { id: 'texting', icon: '📱', title: 'Texting Chemistry Guide', text: 'Keep the spark alive between meetings.' },
      { id: 'firstdate', icon: '🌹', title: 'Your First Date Blueprint', text: 'Designed around your two elements.' },
      { id: 'confidence', icon: '🛡️', title: 'Rejection-Proof Confidence Plan', text: 'Walk in calm, whatever happens.' },
      { id: 'forecast90', icon: '🔮', title: 'Your Next 90 Days', text: 'The three windows that decide this.' },
      { id: 'marriage', icon: '💍', title: 'Could This Become Forever?', text: 'The long arc, if you act on it.' },
    ],
  },
  define: {
    stage: 'define',
    name: 'The Define-The-Relationship Kit',
    tagline: 'From no-label to a real “us” — without losing what you already have.',
    badge: 'ONE-TIME OFFER',
    sections: [
      { id: 'dtr', icon: '💬', title: 'The “What Are We?” Conversation Script', text: 'Word-for-word, without the panic.' },
      { id: 'escalate', icon: '🪜', title: 'The Friends-to-Lovers Roadmap', text: 'Escalate without ruining what you have.' },
      { id: 'signals', icon: '🔍', title: 'Reading Their Real Intentions', text: 'What they want vs. what they say.' },
      { id: 'exclusive', icon: '🔒', title: 'The Exclusivity Conversation', text: 'When and how to ask for more.' },
      { id: 'boundaries', icon: '🧭', title: 'Rules of the In-Between', text: 'Protect your heart while it’s undefined.' },
      { id: 'intimacy', icon: '🔥', title: 'Intimacy & Attachment Decoder', text: 'What closeness means to each of you.' },
      { id: 'forecast90', icon: '🔮', title: 'Next 90 Days: Define or Drift', text: 'The fork in the road, dated.' },
      { id: 'marriage', icon: '💍', title: 'From “No Label” to Something Real', text: 'What this becomes if you name it.' },
    ],
  },
  committed: {
    stage: 'committed',
    name: 'Premium Love Deep-Dive',
    tagline: 'Go from a quick reading to the complete blueprint — 8 in-depth chapters written for you two.',
    badge: 'ONE-TIME OFFER',
    sections: [
      { id: 'forecast', icon: '🔮', title: '12-Month Love Forecast', text: 'Month-by-month, what’s ahead for you two.' },
      { id: 'marriage', icon: '💍', title: 'Marriage & Commitment Potential', text: 'How likely — and exactly what strengthens it.' },
      { id: 'intimacy', icon: '🔥', title: 'Intimacy Compatibility', text: 'Your physical & emotional chemistry, decoded.' },
      { id: 'blueprint', icon: '🗺️', title: 'Relationship Blueprint', text: 'A step-by-step plan tailored to your match.' },
      { id: 'emotionalgrowth', icon: '💞', title: 'Emotional Growth Plan', text: 'Grow closer, faster — together.' },
      { id: 'conflict', icon: '🎯', title: 'Conflict Resolution Guide', text: 'Turn friction into closeness.' },
      { id: 'dateideas', icon: '🌹', title: '50 Date Ideas For Your Match', text: 'Hand-picked for your two archetypes.' },
      { id: 'communicationguide', icon: '💬', title: 'Deep Communication Guide', text: 'Say the hard things, the right way.' },
    ],
  },
  rekindle: {
    stage: 'rekindle',
    name: 'The Second-Chance Playbook',
    tagline: 'Reunion or closure — either way, you walk away with clarity.',
    badge: 'ONE-TIME OFFER',
    sections: [
      { id: 'shouldyou', icon: '⚖️', title: 'Should You Reach Out? The Honest Answer', text: 'Your charts, minus the nostalgia.' },
      { id: 'firstmessage', icon: '📱', title: 'The First Message Script', text: 'What to send — and what never to.' },
      { id: 'whatbroke', icon: '🧩', title: 'What Actually Broke (and What’s Fixable)', text: 'The real pattern, named.' },
      { id: 'newrules', icon: '📜', title: 'New Story, New Rules', text: 'Why round two must be different.' },
      { id: 'trust', icon: '🕰️', title: 'The Trust Rebuild Timeline', text: 'Week by week, realistically.' },
      { id: 'closure', icon: '🕊️', title: 'The Closure Alternative', text: 'If you choose to walk away — whole.' },
      { id: 'forecast90', icon: '🔮', title: 'Your Next 90 Days', text: 'The decision windows ahead.' },
      { id: 'marriage', icon: '💍', title: 'Reconciliation Potential', text: 'What a second chapter truly requires.' },
    ],
  },
};

/** Commitment-chapter titles per relationship type (kept in sync with the
 *  backend REL_COPY so the offer screen and the delivered report match). */
export const REL_MARRIAGE_TITLE: Record<string, string> = {
  married: 'Recommitment & Forever Potential',
  engaged: 'Marriage Readiness',
  partner: 'Marriage & Commitment Potential',
  future: 'Life-Partner Potential',
  crush: 'Could This Become Forever?',
  like: 'Could This Become Something?',
  curious: 'If Curiosity Became Commitment',
  situationship: 'From “No Label” to Something Real',
  secret: 'When the Secret Meets Daylight',
  friend: 'From Friends to Forever?',
  ex: 'Reconciliation Potential',
};

export function getUpsellPack(rel: string | null | undefined): UpsellPack {
  const pack = UPSELL_PACKS[stageForRelationship(rel)];
  const marriageTitle = rel ? REL_MARRIAGE_TITLE[rel] : undefined;
  return {
    ...pack,
    sections: pack.sections.map((s) => {
      if (s.id === 'marriage' && marriageTitle) return { ...s, title: marriageTitle };
      if (s.id === 'escalate' && rel !== 'friend')
        return { ...s, title: 'The Something-More Roadmap' }; // friends keep “Friends-to-Lovers”
      return s;
    }),
  };
}

/** Legacy export — the committed-stage pack with pricing attached. */
export const UPSELL: Offer & { tagline: string; sections: UpsellSection[] } = {
  id: 'premium-deepdive',
  name: UPSELL_PACKS.committed.name,
  price: UPSELL_PRICE,
  compareAt: 99,
  badge: UPSELL_PACKS.committed.badge,
  tagline: UPSELL_PACKS.committed.tagline,
  sections: UPSELL_PACKS.committed.sections,
};

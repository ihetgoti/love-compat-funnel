/** Cinematic analysis beats — each shown for a few seconds while the (already
 *  computed) result is "discovered". Pure anticipation theater. */
export const ANALYSIS_BEATS: { icon: string; text: string }[] = [
  { icon: '💫', text: 'Reading your emotional energies…' },
  { icon: '🌙', text: 'Aligning your birth charts…' },
  { icon: '🔮', text: 'Discovering hidden compatibility patterns…' },
  { icon: '🧬', text: 'Analyzing your shared personality traits…' },
  { icon: '💞', text: 'Calculating soulmate resonance…' },
  { icon: '✨', text: 'Revealing your hidden strengths…' },
  { icon: '❤️', text: 'Sealing your results with love…' },
];

export const TRUST_SIGNALS: string[] = [
  '🔒 100% private',
  '⚡ Instant results',
  '↩️ Money-back promise',
];

export interface Testimonial {
  name: string;
  text: string;
  stars: number;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Maya R.', text: 'Okay this was SCARY accurate. The growth area part made me cry a little 🥹', stars: 5 },
  { name: 'Jordan T.', text: 'Showed it to him and now it’s our whole personality. 10/10.', stars: 5 },
  { name: 'Priya K.', text: 'Best $3 I’ve ever spent. The future forecast gave me chills.', stars: 5 },
  { name: 'Sam D.', text: 'I was “just curious”… now we’re planning a trip. Thanks Cupid 😅', stars: 5 },
];

/** Live-ish social proof base (a gentle, believable number). */
export const SOCIAL_PROOF_BASE = 18_493;

export const MONEY_BACK =
  'Love it or get a full refund — no questions, no awkwardness.';

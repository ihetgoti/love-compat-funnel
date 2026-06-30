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

export const MICRO_OFFER: Offer & { features: OfferFeature[] } = {
  id: 'full-report',
  name: 'Your Full Compatibility Report',
  price: 2.99,
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
  icon: string;
  title: string;
  text: string;
}

export const UPSELL: Offer & { tagline: string; sections: UpsellSection[] } = {
  id: 'premium-deepdive',
  name: 'Premium Love Deep-Dive',
  price: 27,
  compareAt: 49,
  badge: 'ONE-TIME OFFER',
  tagline: 'Most couples add this to go from “we match” to “we last.”',
  sections: [
    { icon: '🔮', title: '12-Month Love Forecast', text: 'Month-by-month, what’s ahead for you two.' },
    { icon: '💍', title: 'Marriage & Commitment Potential', text: 'How likely — and exactly what strengthens it.' },
    { icon: '🔥', title: 'Intimacy Compatibility', text: 'Your physical & emotional chemistry, decoded.' },
    { icon: '🗺️', title: 'Relationship Blueprint', text: 'A step-by-step plan tailored to your match.' },
    { icon: '💞', title: 'Emotional Growth Plan', text: 'Grow closer, faster — together.' },
    { icon: '🎯', title: 'Conflict Resolution Guide', text: 'Turn friction into closeness.' },
    { icon: '🌹', title: '50 Date Ideas For Your Match', text: 'Hand-picked for your two archetypes.' },
    { icon: '💬', title: 'Deep Communication Guide', text: 'Say the hard things, the right way.' },
  ],
};

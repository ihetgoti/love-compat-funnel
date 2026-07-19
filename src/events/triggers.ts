import type { Trigger } from './eventEngine';

/**
 * Contextual comic-event triggers. Always warm, playful, and positive — never
 * shaming or judgmental. Higher weight = higher priority within a slot.
 */
export const TRIGGERS: Trigger[] = [
  // -------- after relationship is chosen --------
  { id: 'rel-crush', slot: 'afterRelationship', weight: 5, mascot: 'cupid', mood: 'wink', when: (c) => c.relationshipType === 'crush', message: () => 'Your secret’s safe with me 🤫 Some of the best love stories begin with a crush.' },
  { id: 'rel-secret', slot: 'afterRelationship', weight: 5, mascot: 'matchmaker', mood: 'knowing', when: (c) => c.relationshipType === 'secret', message: () => 'A secret romance? The stars do love a good plot twist… 🤫✨' },
  { id: 'rel-ex', slot: 'afterRelationship', weight: 5, mascot: 'cupid', mood: 'happy', when: (c) => c.relationshipType === 'ex', message: () => 'Some stories deserve a second look. Let’s see what the universe thinks 💫' },
  { id: 'rel-friend', slot: 'afterRelationship', weight: 5, mascot: 'cupid', mood: 'wink', when: (c) => c.relationshipType === 'friend', message: () => 'Friends-to-lovers? Honestly, my favorite genre 👀' },
  { id: 'rel-curious', slot: 'afterRelationship', weight: 4, mascot: 'fortuneCat', mood: 'giggle', when: (c) => c.relationshipType === 'curious', message: () => '“Just curious”… that’s exactly how every great love starts 😼' },
  { id: 'rel-situationship', slot: 'afterRelationship', weight: 5, mascot: 'fortuneCat', mood: 'wink', when: (c) => c.relationshipType === 'situationship', message: () => 'No label? No problem — the stars don’t need one to read you two 🫧' },
  { id: 'rel-future', slot: 'afterRelationship', weight: 5, mascot: 'matchmaker', mood: 'reveal', when: (c) => c.relationshipType === 'future', message: () => 'Manifesting your future love? Let’s read the signs together 🔮' },
  { id: 'rel-married', slot: 'afterRelationship', weight: 5, mascot: 'cupid', mood: 'cheer', when: (c) => c.relationshipType === 'married', message: () => 'Still curious after “I do”? That’s the beautiful kind of love 💍' },
  { id: 'rel-like', slot: 'afterRelationship', weight: 4, mascot: 'cupid', mood: 'happy', when: (c) => c.relationshipType === 'like', message: () => 'Someone special, hm? Let’s find out if they feel it too 💖' },
  { id: 'rel-default', slot: 'afterRelationship', weight: 1, mascot: 'cupid', mood: 'happy', when: () => true, message: () => 'Ooh, exciting. Let’s discover what your hearts are hiding 💞' },

  // -------- after both birthdays are set --------
  { id: 'dob-same-birthday', slot: 'afterDob', weight: 9, mascot: 'fortuneCat', mood: 'wow', when: (c) => !!c.flags?.sameBirthday, message: () => 'WHOA — you two share a birthday?! That’s incredibly rare 🎉' },
  // Only fires when BOTH people explicitly chose the same gender (never inferred).
  { id: 'dob-same-gender', slot: 'afterDob', weight: 8, mascot: 'cupid', mood: 'cheer', when: (c) => c.you.gender !== 'unspecified' && c.you.gender === c.partner.gender, message: () => 'Love is love — and yours is written in the stars 🌈✨' },
  { id: 'dob-same-sign', slot: 'afterDob', weight: 7, mascot: 'matchmaker', mood: 'reveal', when: (c) => !!c.flags?.sameSign && !c.flags?.sameBirthday, message: (c) => `Two ${c.youSign.name}s… two souls under the very same stars ✨` },
  { id: 'dob-same-element', slot: 'afterDob', weight: 6, mascot: 'matchmaker', mood: 'knowing', when: (c) => !!c.flags?.sameElement && !c.flags?.sameSign, message: (c) => `Kindred ${c.youSign.element} energies — this one could run deep 🌊🔥` },
  { id: 'dob-age-gap', slot: 'afterDob', weight: 6, mascot: 'cupid', mood: 'happy', when: (c) => (c.flags?.ageGapYears ?? 0) >= 12, message: () => 'A little age gap? Love sometimes writes its own rules ❤️' },
  { id: 'dob-master', slot: 'afterDob', weight: 7, mascot: 'matchmaker', mood: 'reveal', when: (c) => !!c.flags?.masterNumber, message: () => 'A rare master number is glowing in your charts… ✨' },
  { id: 'dob-shared-path', slot: 'afterDob', weight: 5, mascot: 'matchmaker', mood: 'knowing', when: (c) => !!c.flags?.sharedLifePath && !c.flags?.masterNumber, message: () => 'You walk the same life-path number. Fascinating… 🔢' },
  { id: 'dob-default', slot: 'afterDob', weight: 1, mascot: 'cupid', mood: 'cheer', when: () => true, message: () => 'Perfect. The energies are lining up — hold tight 💫' },

  // -------- on the results reveal --------
  { id: 'res-very-high', slot: 'results', weight: 9, mascot: 'matchmaker', mood: 'reveal', when: (c) => !!c.flags?.veryHighScore, message: () => 'Whoa… this connection is radiating unusually strong energy ✨' },
  { id: 'res-crush-high', slot: 'results', weight: 8, mascot: 'fortuneCat', mood: 'giggle', when: (c) => c.relationshipType === 'crush' && (c.score ?? 0) >= 85, message: () => 'Tell them. Seriously. Look at this score 😼💘' },
  { id: 'res-ex-high', slot: 'results', weight: 8, mascot: 'cupid', mood: 'wink', when: (c) => c.relationshipType === 'ex' && (c.score ?? 0) >= 85, message: () => 'Well, well… the spark is clearly still alive 🔥' },
  { id: 'res-married-high', slot: 'results', weight: 7, mascot: 'cupid', mood: 'cheer', when: (c) => c.relationshipType === 'married' && (c.score ?? 0) >= 85, message: () => 'Together this long and still this strong? Beautiful 💕' },
  { id: 'res-default', slot: 'results', weight: 1, mascot: 'cupid', mood: 'cheer', when: () => true, message: () => 'I had a good feeling about you two 💞' },
];

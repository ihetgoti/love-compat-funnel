export interface QuestionOption {
  id: string;
  label: string;
  emoji: string;
}

export interface Question {
  id: string; // matches keys read by the engine's answerAlignment
  prompt: string;
  subtitle?: string;
  kind: 'single' | 'scale';
  options?: QuestionOption[];
  scale?: { min: number; max: number; lowLabel: string; highLabel: string; icon: string };
  /** A little mascot beat shown after this question (optional delight). */
  beat?: { mascot: 'cupid' | 'matchmaker' | 'fortuneCat'; mood: string; line: string };
}

/**
 * Q2–Q8. Tap-only — no typing until after Q8 (personal info). Option IDs are
 * intentionally aligned with `answerAlignment` in the engine.
 */
export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'motivation',
    prompt: 'What made you check compatibility today?',
    subtitle: 'No wrong answers — be honest 💗',
    kind: 'single',
    options: [
      { id: 'love', label: 'I truly love them', emoji: '❤️' },
      { id: 'cantstop', label: 'I can’t stop thinking about them', emoji: '💭' },
      { id: 'challenges', label: 'We have our challenges', emoji: '🌧️' },
      { id: 'future', label: 'I want to know our future', emoji: '🔮' },
      { id: 'curious', label: 'Just curious', emoji: '👀' },
    ],
  },
  {
    id: 'curiosity',
    prompt: 'What are you most curious to discover?',
    kind: 'single',
    options: [
      { id: 'soulmate', label: 'Soulmate potential', emoji: '💞' },
      { id: 'future', label: 'Our future together', emoji: '🔮' },
      { id: 'chemistry', label: 'Our chemistry', emoji: '⚡' },
      { id: 'communication', label: 'How we communicate', emoji: '💬' },
      { id: 'challenges', label: 'Hidden challenges', emoji: '🌱' },
      { id: 'emotional', label: 'Emotional connection', emoji: '🫶' },
    ],
    beat: { mascot: 'cupid', mood: 'wink', line: 'Ooh, good choice. I had a feeling about you two 😉' },
  },
  {
    id: 'importance',
    prompt: 'How important is this relationship to you?',
    subtitle: 'Tap the hearts',
    kind: 'scale',
    scale: { min: 1, max: 5, lowLabel: 'A little', highLabel: 'Everything', icon: '❤️' },
  },
  {
    id: 'oneword',
    prompt: 'Describe this relationship in one word.',
    kind: 'single',
    options: [
      { id: 'magical', label: 'Magical', emoji: '✨' },
      { id: 'exciting', label: 'Exciting', emoji: '🎢' },
      { id: 'passionate', label: 'Passionate', emoji: '🔥' },
      { id: 'complicated', label: 'Complicated', emoji: '🌀' },
      { id: 'stable', label: 'Stable', emoji: '🪴' },
      { id: 'uncertain', label: 'Uncertain', emoji: '🌫️' },
    ],
  },
  {
    id: 'destiny',
    prompt: 'Do you believe some relationships are destined?',
    kind: 'single',
    options: [
      { id: 'absolutely', label: 'Absolutely', emoji: '💫' },
      { id: 'maybe', label: 'Maybe…', emoji: '🌙' },
      { id: 'notsure', label: 'Not sure', emoji: '🤔' },
    ],
    beat: { mascot: 'matchmaker', mood: 'knowing', line: 'The stars have opinions about this one… ✨' },
  },
  {
    id: 'connection',
    prompt: 'Have you ever felt an unusual connection with this person?',
    subtitle: 'That feeling you can’t quite explain',
    kind: 'single',
    options: [
      { id: 'often', label: 'Yes, often', emoji: '🔮' },
      { id: 'sometimes', label: 'Once or twice', emoji: '💓' },
      { id: 'notyet', label: 'Not yet', emoji: '🌱' },
    ],
  },
  {
    id: 'surprise',
    prompt: 'What result would surprise you the most?',
    kind: 'single',
    options: [
      { id: 'soulmates', label: 'That we’re soulmates', emoji: '💞' },
      { id: 'perfect', label: 'That we’re a perfect match', emoji: '⭐' },
      { id: 'challenges', label: 'That we have hidden challenges', emoji: '🌱' },
      { id: 'meant', label: 'That we’re truly meant to be', emoji: '🔮' },
    ],
  },
];

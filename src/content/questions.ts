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
    id: 'importance',
    prompt: 'How important is this relationship to you?',
    subtitle: 'Tap the hearts',
    kind: 'scale',
    scale: { min: 1, max: 5, lowLabel: 'A little', highLabel: 'Everything', icon: '❤️' },
  },
];

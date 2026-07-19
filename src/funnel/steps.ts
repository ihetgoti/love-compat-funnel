import { QUIZ_QUESTIONS, type Question } from '@/content/questions';

export type StepId =
  | 'relationship'
  | 'q-motivation' | 'q-curiosity' | 'q-importance' | 'q-oneword' | 'q-destiny' | 'q-connection' | 'q-surprise'
  | 'personal' | 'dob' | 'analysis' | 'results'
  | 'offer' | 'checkout' | 'upsell' | 'report' | 'email' | 'share';

export const QUIZ_STEP_IDS = QUIZ_QUESTIONS.map((q) => `q-${q.id}`) as StepId[];

export const STEP_ORDER: StepId[] = [
  'relationship',
  ...QUIZ_STEP_IDS,
  'personal',
  'dob',
  'analysis',
  'results',
  'offer',
  'checkout',
  // Paying the micro offer lands you straight in your report (instant reward).
  // The upsell only appears AFTER every chapter has been read (see FinalReport).
  'report',
  'upsell',
  'email',
  'share',
];

/** Explicit progress-bar fill per step (the "journey" phase only).
 *  Steps absent from this map hide the progress bar (the monetization phase). */
const PROGRESS: Partial<Record<StepId, number>> = {
  relationship: 6,
  'q-motivation': 16,
  'q-curiosity': 27,
  'q-importance': 38,
  'q-oneword': 49,
  'q-destiny': 60,
  'q-connection': 71,
  'q-surprise': 82,
  personal: 90,
  dob: 95,
  analysis: 99,
  results: 100,
};

export function stepIndex(step: StepId): number {
  return STEP_ORDER.indexOf(step);
}

export function nextStep(step: StepId): StepId | null {
  const i = stepIndex(step);
  return i >= 0 && i < STEP_ORDER.length - 1 ? STEP_ORDER[i + 1] : null;
}

export function prevStep(step: StepId): StepId | null {
  const i = stepIndex(step);
  return i > 0 ? STEP_ORDER[i - 1] : null;
}

export function progressFor(step: StepId): number | null {
  return PROGRESS[step] ?? null;
}

export function showsProgressBar(step: StepId): boolean {
  return PROGRESS[step] != null;
}

/** The quiz Question backing a `q-*` step, if any. */
export function questionForStep(step: StepId): Question | null {
  if (!step.startsWith('q-')) return null;
  const id = step.slice(2);
  return QUIZ_QUESTIONS.find((q) => q.id === id) ?? null;
}

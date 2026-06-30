'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CompatibilityResult, Person } from '@/engine/types';
import { computeCompatibility } from '@/engine';
import type { RelationshipTypeId } from '@/content/relationshipTypes';
import { type StepId, nextStep } from '@/funnel/steps';

const EMPTY_PERSON: Person = { name: '', gender: 'unspecified', dob: null };

interface QuizState {
  hydrated: boolean;
  step: StepId;
  history: StepId[];
  completed: StepId[];
  startedAt: number | null;

  relationshipType: RelationshipTypeId | null;
  answers: Record<string, string>;
  you: Person;
  partner: Person;
  results: CompatibilityResult | null;

  order: { microPurchased: boolean; upsellPurchased: boolean; total: number };
  email: string | null;
  shareCount: number;

  // actions
  setHydrated: () => void;
  start: () => void;
  goto: (step: StepId) => void;
  next: () => void;
  back: () => void;
  setRelationship: (id: RelationshipTypeId) => void;
  setAnswer: (questionId: string, value: string) => void;
  setYou: (patch: Partial<Person>) => void;
  setPartner: (patch: Partial<Person>) => void;
  compute: () => void;
  purchaseMicro: () => void;
  purchaseUpsell: () => void;
  setEmail: (email: string) => void;
  incShare: () => void;
  reset: () => void;
}

const initialData = {
  step: 'relationship' as StepId,
  history: [] as StepId[],
  completed: [] as StepId[],
  startedAt: null as number | null,
  relationshipType: null as RelationshipTypeId | null,
  answers: {} as Record<string, string>,
  you: { ...EMPTY_PERSON },
  partner: { ...EMPTY_PERSON },
  results: null as CompatibilityResult | null,
  order: { microPurchased: false, upsellPurchased: false, total: 0 },
  email: null as string | null,
  shareCount: 0,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialData,

      setHydrated: () => set({ hydrated: true }),

      start: () => {
        if (get().startedAt == null) set({ startedAt: Date.now() });
      },

      goto: (step) =>
        set((s) => ({
          step,
          history: [...s.history, s.step],
          completed: s.completed.includes(s.step) ? s.completed : [...s.completed, s.step],
        })),

      next: () => {
        const nxt = nextStep(get().step);
        if (nxt) get().goto(nxt);
      },

      back: () =>
        set((s) => {
          if (s.history.length === 0) return s;
          const hist = s.history.slice();
          let prev = hist.pop() as StepId;
          // Never land back on the cinematic analysis — skip to what preceded it.
          if (prev === 'analysis') prev = (hist.pop() as StepId) ?? 'dob';
          return { step: prev, history: hist };
        }),

      setRelationship: (id) => set({ relationshipType: id }),

      setAnswer: (questionId, value) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: value } })),

      setYou: (patch) => set((s) => ({ you: { ...s.you, ...patch } })),
      setPartner: (patch) => set((s) => ({ partner: { ...s.partner, ...patch } })),

      compute: () => {
        const { you, partner, relationshipType, answers } = get();
        const results = computeCompatibility({ you, partner, relationshipType, answers });
        set({ results });
      },

      purchaseMicro: () =>
        set((s) => ({
          order: {
            ...s.order,
            microPurchased: true,
            total: Number((s.order.total + 2.99).toFixed(2)),
          },
        })),

      purchaseUpsell: () =>
        set((s) => ({
          order: {
            ...s.order,
            upsellPurchased: true,
            total: Number((s.order.total + 27).toFixed(2)),
          },
        })),

      setEmail: (email) => set({ email }),
      incShare: () => set((s) => ({ shareCount: s.shareCount + 1 })),

      reset: () => set({ ...initialData, you: { ...EMPTY_PERSON }, partner: { ...EMPTY_PERSON } }),
    }),
    {
      name: 'lovecompat:v1',
      version: 1,
      // Guard against SSR (no localStorage) and defer rehydration to the client
      // so the server and first client render match (see FunnelController).
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      skipHydration: true,
      partialize: (s) => ({
        step: s.step,
        history: s.history,
        completed: s.completed,
        startedAt: s.startedAt,
        relationshipType: s.relationshipType,
        answers: s.answers,
        you: s.you,
        partner: s.partner,
        results: s.results,
        order: s.order,
        email: s.email,
        shareCount: s.shareCount,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

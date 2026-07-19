'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CompatibilityResult, Person } from '@/engine/types';
import type { FullReport } from '@/engine/report';
import { computeCompatibility } from '@/engine';
import type { RelationshipTypeId } from '@/content/relationshipTypes';
import { getPricing, type CountryCode } from '@/content/pricing';
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

  /** Post-paywall report — generated on the BACKEND (/api/report), cached here. */
  report: FullReport | null;
  reportLoading: boolean;
  reportError: boolean;
  /** Chapter ids the reader has tapped open (drives progress + upsell gate). */
  openedChapters: string[];

  /** PPP market for pricing display + order totals. */
  currency: CountryCode;
  currencyChosen: boolean; // true once the user manually picked (stops auto-detect)

  order: { microPurchased: boolean; upsellPurchased: boolean; total: number; currency: CountryCode };
  upsellDeclined: boolean;
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
  fetchReport: () => Promise<void>;
  openChapter: (id: string) => void;
  setCurrency: (code: CountryCode, manual?: boolean) => void;
  purchaseMicro: () => void;
  purchaseUpsell: () => void;
  declineUpsell: () => void;
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
  report: null as FullReport | null,
  reportLoading: false,
  reportError: false,
  openedChapters: [] as string[],
  currency: 'US' as CountryCode,
  currencyChosen: false,
  order: { microPurchased: false, upsellPurchased: false, total: 0, currency: 'US' as CountryCode },
  upsellDeclined: false,
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

      /** Fetch the report from the backend generator. Cached; safe to re-call. */
      fetchReport: async () => {
        const { you, partner, relationshipType, answers, report, reportLoading } = get();
        if (report || reportLoading) return;
        set({ reportLoading: true, reportError: false });
        try {
          const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ you, partner, relationshipType, answers }),
          });
          const data = (await res.json()) as { ok: boolean; report?: FullReport };
          if (!res.ok || !data.ok || !data.report) throw new Error('bad-response');
          set({ report: data.report, reportLoading: false });
        } catch {
          set({ reportLoading: false, reportError: true });
        }
      },

      openChapter: (id) =>
        set((s) =>
          s.openedChapters.includes(id) ? s : { openedChapters: [...s.openedChapters, id] },
        ),

      setCurrency: (code, manual = false) =>
        set((s) => ({
          currency: code,
          currencyChosen: manual || s.currencyChosen,
        })),

      purchaseMicro: () =>
        set((s) => {
          const p = getPricing(s.currency);
          return {
            order: {
              ...s.order,
              microPurchased: true,
              currency: s.currency,
              total: Number((s.order.total + p.micro).toFixed(2)),
            },
          };
        }),

      purchaseUpsell: () =>
        set((s) => {
          const p = getPricing(s.currency);
          return {
            order: {
              ...s.order,
              upsellPurchased: true,
              currency: s.currency,
              total: Number((s.order.total + p.upsell).toFixed(2)),
            },
          };
        }),

      declineUpsell: () => set({ upsellDeclined: true }),

      setEmail: (email) => set({ email }),
      incShare: () => set((s) => ({ shareCount: s.shareCount + 1 })),

      reset: () =>
        set({
          ...initialData,
          you: { ...EMPTY_PERSON },
          partner: { ...EMPTY_PERSON },
          order: { ...initialData.order },
        }),
    }),
    {
      name: 'lovecompat:v1',
      version: 2,
      migrate: (persisted) => persisted as QuizState, // v1→v2: new fields fall back to defaults via merge
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
        report: s.report,
        openedChapters: s.openedChapters,
        currency: s.currency,
        currencyChosen: s.currencyChosen,
        order: s.order,
        upsellDeclined: s.upsellDeclined,
        email: s.email,
        shareCount: s.shareCount,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

'use client';

/**
 * Lightweight funnel analytics.
 *
 * Fans every funnel event out to Meta Pixel (`fbq`) and Snap Pixel (`snaptr`)
 * when their pixel IDs are configured, and logs to the console in development.
 * With no pixel IDs set, every call is a safe no-op — the app runs anywhere.
 */

type Props = Record<string, string | number | boolean | undefined>;

export type FunnelEvent =
  | 'QuizStart'
  | 'ViewStep'
  | 'AnswerQuestion'
  | 'ProfileComplete'
  | 'AnalysisComplete'
  | 'ViewResults'
  | 'ViewOffer'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'ViewUpsell'
  | 'UpsellPurchase'
  | 'Lead'
  | 'Share';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    snaptr?: (...args: unknown[]) => void;
  }
}

/** Map our funnel events to Meta standard events (custom event always sent too). */
const FB_STANDARD: Partial<Record<FunnelEvent, string>> = {
  QuizStart: 'StartTrial',
  ViewOffer: 'ViewContent',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  UpsellPurchase: 'Purchase',
  Lead: 'Lead',
};

const SNAP_STANDARD: Partial<Record<FunnelEvent, string>> = {
  QuizStart: 'START_CHECKOUT',
  ViewOffer: 'VIEW_CONTENT',
  InitiateCheckout: 'START_CHECKOUT',
  Purchase: 'PURCHASE',
  UpsellPurchase: 'PURCHASE',
  Lead: 'SIGN_UP',
};

function noop(): void {
  /* swallow pixel errors — analytics must never break the funnel */
}

export function track(event: FunnelEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV !== 'production') {
    console.debug(`%c[track] ${event}`, 'color:#ff5d8f', props);
  }

  if (window.fbq) {
    try {
      window.fbq('trackCustom', event, props);
      const std = FB_STANDARD[event];
      if (std) window.fbq('track', std, props);
    } catch {
      noop();
    }
  }

  if (window.snaptr) {
    try {
      const std = SNAP_STANDARD[event] ?? event;
      window.snaptr('track', std, props);
    } catch {
      noop();
    }
  }
}

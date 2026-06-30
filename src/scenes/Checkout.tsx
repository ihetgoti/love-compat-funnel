'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { MICRO_OFFER } from '@/content/offers';
import { money } from '@/lib/format';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function Checkout() {
  const purchaseMicro = useQuizStore((s) => s.purchaseMicro);
  const next = useQuizStore((s) => s.next);
  const [processing, setProcessing] = useState(false);

  const pay = () => {
    if (processing) return;
    setProcessing(true);
    haptic('success');
    setTimeout(() => {
      purchaseMicro();
      track('Purchase', { value: MICRO_OFFER.price, content: 'full-report' });
      next();
    }, 1500);
  };

  return (
    <SceneShell>
      <h1 className="text-[1.5rem] font-extrabold leading-tight">Secure Checkout</h1>
      <p className="mt-1 text-sm text-muted">You’re seconds away from your full reading 💌</p>

      {/* order summary */}
      <div className="mt-5 rounded-3xl glass p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-starlight">{MICRO_OFFER.name}</div>
            <div className="text-xs text-muted">Instant digital access · lifetime</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-starlight">{money(MICRO_OFFER.price)}</div>
            <div className="text-xs text-muted line-through">{money(MICRO_OFFER.compareAt)}</div>
          </div>
        </div>
        <div className="my-3 h-px bg-white/10" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Total due today</span>
          <span className="font-display text-2xl font-extrabold gold-text">{money(MICRO_OFFER.price)}</span>
        </div>
      </div>

      {/* express pay (simulated) */}
      <div className="mt-4 flex flex-col gap-2.5">
        <button
          onClick={pay}
          disabled={processing}
          className="tap flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-bold text-black active:scale-[0.98]"
        >
          <span></span> Pay
        </button>
        <button
          onClick={pay}
          disabled={processing}
          className="tap flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] text-[15px] font-bold text-starlight active:scale-[0.98]"
        >
          <span className="text-lg">G</span> Pay
        </button>
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-white/10" /> or pay with card <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* mock card fields */}
      <div className="flex flex-col gap-2.5 opacity-90">
        <div className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5 text-sm text-muted">
          Card number · 4242 4242 4242 4242
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5 text-sm text-muted">
            MM / YY
          </div>
          <div className="w-24 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5 text-sm text-muted">
            CVC
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-muted">
        🔒 Encrypted & secure · This is a simulated demo checkout
      </div>

      <StickyCta caption="↩️ 100% money-back promise">
        <Button variant="primary" onClick={pay} disabled={processing}>
          {processing ? 'Processing…' : `Pay ${money(MICRO_OFFER.price)} →`}
        </Button>
      </StickyCta>

      <AnimatePresence>
        {processing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-4 border-white/20 border-t-rose"
            />
            <div className="mt-4 text-sm font-semibold text-starlight">Confirming your love report…</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SceneShell>
  );
}

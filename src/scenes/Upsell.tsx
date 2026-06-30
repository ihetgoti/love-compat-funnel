'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { UPSELL } from '@/content/offers';
import { money } from '@/lib/format';
import { staggerContainer, riseItem } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function Upsell() {
  const purchaseUpsell = useQuizStore((s) => s.purchaseUpsell);
  const next = useQuizStore((s) => s.next);

  useEffect(() => {
    track('ViewUpsell', { value: UPSELL.price });
  }, []);

  const discount = Math.round((1 - UPSELL.price / UPSELL.compareAt) * 100);

  const add = () => {
    haptic('success');
    purchaseUpsell();
    track('UpsellPurchase', { value: UPSELL.price });
    next();
  };
  const skip = () => {
    haptic('tap');
    next();
  };

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div
          variants={riseItem}
          className="flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200"
        >
          <span className="text-lg">✓</span> Payment confirmed — your report is unlocking!
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 text-center">
          <div className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            {UPSELL.badge}
          </div>
          <h1 className="mt-2 text-[1.7rem] font-extrabold leading-tight">
            Wait — add the <span className="romance-text">Premium Deep-Dive</span>?
          </h1>
          <p className="mt-1.5 text-sm text-muted">{UPSELL.tagline}</p>
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 grid grid-cols-1 gap-2.5">
          {UPSELL.sections.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3"
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-starlight">{s.title}</div>
                <div className="text-xs text-muted">{s.text}</div>
              </div>
              <span className="text-emerald-300">＋</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 flex flex-col items-center rounded-3xl glass p-4">
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-extrabold gold-text">{money(UPSELL.price)}</span>
            <span className="mb-1 text-base font-semibold text-muted line-through">{money(UPSELL.compareAt)}</span>
          </div>
          <div className="mt-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            {discount}% OFF · one-time only
          </div>
        </motion.div>
      </motion.div>

      <StickyCta
        caption={
          <button onClick={skip} className="tap underline-offset-2 hover:underline">
            No thanks, just show my report
          </button>
        }
      >
        <Button variant="gold" onClick={add}>
          Yes! Add it to my report — {money(UPSELL.price)}
        </Button>
      </StickyCta>
    </SceneShell>
  );
}

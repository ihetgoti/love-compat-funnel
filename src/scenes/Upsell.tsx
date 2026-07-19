'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { getUpsellPack } from '@/content/offers';
import { getPricing, formatMoney } from '@/content/pricing';
import { staggerContainer, riseItem } from '@/design/motion';
import { firstName } from '@/lib/format';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

/**
 * Shown ONLY after the reader has opened every chapter of the micro report
 * (gated by FinalReport's celebration overlay). Never reported to ad pixels —
 * ViewUpsell/UpsellPurchase are on the internal-only blocklist in track().
 */
export function Upsell() {
  const purchaseUpsell = useQuizStore((s) => s.purchaseUpsell);
  const declineUpsell = useQuizStore((s) => s.declineUpsell);
  const currency = useQuizStore((s) => s.currency);
  const partner = useQuizStore((s) => s.partner);
  const relationshipType = useQuizStore((s) => s.relationshipType);
  const goto = useQuizStore((s) => s.goto);
  const p = getPricing(currency);
  // The product itself is stage-matched to their first funnel answer:
  // crush → Make-It-Happen Kit · situationship/friend → Define-It Kit ·
  // ex → Second-Chance Playbook · committed types → Deep-Dive.
  const pack = getUpsellPack(relationshipType);

  useEffect(() => {
    track('ViewUpsell', { value: p.upsell, currency: p.currency }); // internal-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discount = Math.round((1 - p.upsell / p.upsellCompareAt) * 100);

  const add = () => {
    haptic('success');
    purchaseUpsell();
    track('UpsellPurchase', { value: p.upsell, currency: p.currency }); // internal-only
    goto('report'); // back to the report — premium chapters are now unlocked
  };
  const skip = () => {
    haptic('tap');
    declineUpsell();
    goto('email');
  };

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div
          variants={riseItem}
          className="flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200"
        >
          <span className="text-lg">✓</span> Reading complete — you now know your match.
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 text-center">
          <div className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            {pack.badge}
          </div>
          <h1 className="mt-2 text-[1.7rem] font-extrabold leading-tight">
            <span className="romance-text">{pack.name}</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">{pack.tagline}</p>
          <p className="mt-1.5 text-xs text-muted">
            You kept seeing the locked chapters — here’s everything inside, written for you and{' '}
            {firstName(partner.name, 'them')}:
          </p>
        </motion.div>

        <motion.div variants={riseItem} className="mt-5 grid grid-cols-1 gap-2.5">
          {pack.sections.map((s) => (
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
            <span className="font-display text-4xl font-extrabold gold-text">
              {formatMoney(p.upsell, currency)}
            </span>
            <span className="mb-1 text-base font-semibold text-muted line-through">
              {formatMoney(p.upsellCompareAt, currency)}
            </span>
          </div>
          <div className="mt-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            {discount}% OFF · one-time only
          </div>
        </motion.div>
      </motion.div>

      <StickyCta
        caption={
          <button onClick={skip} className="tap underline-offset-2 hover:underline">
            No thanks, take me to my saved report
          </button>
        }
      >
        <Button variant="gold" onClick={add}>
          Unlock {pack.stage === 'committed' ? 'the Deep-Dive' : pack.stage === 'rekindle' ? 'the Playbook' : 'the Kit'} — {formatMoney(p.upsell, currency)}
        </Button>
      </StickyCta>
    </SceneShell>
  );
}

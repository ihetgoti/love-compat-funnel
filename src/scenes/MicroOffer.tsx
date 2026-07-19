'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { useQuizStore } from '@/store/useQuizStore';
import { MICRO_OFFER } from '@/content/offers';
import { getPricing, formatMoney } from '@/content/pricing';
import { TESTIMONIALS, TRUST_SIGNALS, SOCIAL_PROOF_BASE, MONEY_BACK } from '@/content/copy';
import { staggerContainer, riseItem } from '@/design/motion';
import { firstName } from '@/lib/format';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function MicroOffer() {
  const results = useQuizStore((s) => s.results);
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const currency = useQuizStore((s) => s.currency);
  const next = useQuizStore((s) => s.next);
  const timer = useCountdown(600);
  const p = getPricing(currency);

  useEffect(() => {
    track('ViewOffer', { value: p.micro, currency: p.currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discount = Math.round((1 - p.micro / p.microCompareAt) * 100);
  const proof = SOCIAL_PROOF_BASE + (results ? (results.seed % 400) + 120 : 200);

  const checkout = () => {
    haptic('success');
    track('InitiateCheckout', { value: p.micro, currency: p.currency });
    next();
  };

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={riseItem} className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-blush">
          {firstName(you.name, 'You')} <span className="text-rose">❤</span> {firstName(partner.name, 'Them')}
          {results ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gold">
              {results.score}% {results.label}
            </span>
          ) : null}
        </motion.div>

        <motion.h1 variants={riseItem} className="mt-3 text-center text-[1.7rem] font-extrabold leading-tight">
          Unlock Your Full <span className="romance-text">Compatibility Report</span>
        </motion.h1>
        <motion.p variants={riseItem} className="mt-1.5 text-center text-sm text-muted">
          Everything your {results?.score ?? 87}% match is hiding 👀
        </motion.p>

        {/* price block */}
        <motion.div variants={riseItem} className="mt-5 flex flex-col items-center rounded-3xl glass p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-rose/20 px-3 py-1 text-xs font-bold text-blush">
              ⏳ Ends in {timer}
            </div>
            <CurrencyPicker />
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-display text-5xl font-extrabold gold-text">{formatMoney(p.micro, currency)}</span>
            <span className="mb-1.5 text-lg font-semibold text-muted line-through">
              {formatMoney(p.microCompareAt, currency)}
            </span>
          </div>
          <div className="mt-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
            {discount}% OFF · today only
          </div>
        </motion.div>

        {/* value stack */}
        <motion.div variants={riseItem} className="mt-4 rounded-3xl glass p-4">
          <div className="mb-2 text-sm font-bold text-starlight">Here’s everything you unlock:</div>
          <ul className="flex flex-col gap-2">
            {MICRO_OFFER.features.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 text-sm text-starlight/90">
                <span className="text-base">{f.icon}</span>
                <span className="flex-1">{f.text}</span>
                <span className="text-emerald-300">✓</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* trust */}
        <motion.div variants={riseItem} className="mt-4 flex justify-center gap-3 text-xs font-semibold text-muted">
          {TRUST_SIGNALS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </motion.div>

        {/* social proof + testimonial */}
        <motion.div variants={riseItem} className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-center text-xs font-bold text-gold">
            🔥 {proof.toLocaleString()} reports unlocked today
          </div>
          <div className="mt-3 space-y-3">
            {TESTIMONIALS.slice(0, 2).map((t) => (
              <div key={t.name} className="text-sm">
                <div className="text-gold">{'★'.repeat(t.stars)}</div>
                <p className="text-starlight/90">“{t.text}”</p>
                <div className="text-xs text-muted">— {t.name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <StickyCta caption={MONEY_BACK}>
        <Button variant="gold" onClick={checkout}>
          Unlock Full Report — {formatMoney(p.micro, currency)}
        </Button>
      </StickyCta>
    </SceneShell>
  );
}

'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { AuraRing } from '@/art/AuraRing';
import { MascotBeat } from '@/art/MascotBeat';
import { useQuizStore } from '@/store/useQuizStore';
import { buildEventContext, pickEvent } from '@/events/eventEngine';
import { staggerContainer, riseItem } from '@/design/motion';
import { firstName } from '@/lib/format';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function PartialResults() {
  const results = useQuizStore((s) => s.results);
  const compute = useQuizStore((s) => s.compute);
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const relationshipType = useQuizStore((s) => s.relationshipType);
  const next = useQuizStore((s) => s.next);

  useEffect(() => {
    if (!results) compute();
    haptic('reveal');
    track('ViewResults', { score: results?.score ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const event = useMemo(() => {
    if (!results) return null;
    const ctx = buildEventContext({ relationshipType, you, partner, results });
    return pickEvent(ctx, 'results', []);
  }, [results, relationshipType, you, partner]);

  if (!results) return <SceneShell center flush>{null}</SceneShell>;

  const locked = [
    ...results.subscores.map((s) => ({ icon: s.icon, label: s.label, teaser: s.teaser })),
    { icon: '💌', label: 'Personalized Advice', teaser: 'Your tailored next steps to grow closer' },
  ];

  const goOffer = () => {
    haptic('tap');
    track('ViewOffer');
    next();
  };

  return (
    <SceneShell>
      <div className="text-center text-sm font-semibold text-blush">
        {firstName(you.name, 'You')} <span className="text-rose">❤</span>{' '}
        {firstName(partner.name, 'Them')}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 flex flex-col items-center text-center px-4"
      >
        <AuraRing score={results.score} size={150} stroke={10} />
        <div className="mt-4 flex flex-col items-center">
          <span className="text-[1.35rem] font-bold text-blush">{results.label}</span>
          <span className="mt-1 text-[15px] leading-tight text-muted/90">{results.tagline}</span>
        </div>
      </motion.div>

      {event ? (
        <div className="mt-3 flex justify-center">
          <div className="relative p-3 rounded-3xl bg-white/[0.02] border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.03)] backdrop-blur-md">
            <MascotBeat mascot={event.mascot} mood={event.mood}>
              {event.message}
            </MascotBeat>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-white/[0.06] p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-gold">
          ✓ Overall Compatibility — Unlocked
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-starlight/90">
          You’re a <span className="font-bold text-blush">{results.label}</span>.{' '}
          {results.commonThings[0]}
        </p>
      </div>

      <div className="mt-7 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shadow-[0_0_15px_rgba(245,181,74,0.3)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="text-[1.3rem] font-extrabold text-starlight text-glow">Your full reading is ready</h2>
      </div>
      <p className="mt-1 text-sm text-muted">Tap to unlock everything below 👇</p>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-3 flex flex-col gap-2.5"
      >
        {locked.map((item) => (
          <motion.button
            key={item.label}
            variants={riseItem}
            onClick={goOffer}
            className="lock-shimmer tap relative flex items-center gap-4 overflow-hidden rounded-[1.25rem] border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_20px_-8px_rgba(0,0,0,0.5)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">{item.icon}</span>
            <span className="flex-1">
              <span className="block text-[16px] font-bold text-starlight/90">{item.label}</span>
              <span className="block select-none text-xs text-muted/70 blur-[3px] mt-0.5">{item.teaser}</span>
            </span>
            <div className="flex flex-col items-center justify-center rounded-full bg-gold/15 h-8 w-8 border border-gold/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <StickyCta caption="Instant access · 💯 money-back promise">
        <Button variant="primary" onClick={goOffer}>
          Unlock Our Full Report →
        </Button>
      </StickyCta>
    </SceneShell>
  );
}

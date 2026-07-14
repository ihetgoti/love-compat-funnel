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
        className="mt-3 flex flex-col items-center"
      >
        <AuraRing score={results.score} label={results.label} sub={results.tagline} />
      </motion.div>

      {event ? (
        <div className="mt-5 flex justify-center">
          <MascotBeat mascot={event.mascot} mood={event.mood}>
            {event.message}
          </MascotBeat>
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

      <div className="mt-7 flex items-center gap-2">
        <span className="text-lg">🔒</span>
        <h2 className="text-lg font-extrabold">Your full reading is ready</h2>
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
            className="lock-shimmer tap relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5 text-left"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-starlight">{item.label}</span>
              <span className="block select-none text-xs text-muted blur-[3px]">{item.teaser}</span>
            </span>
            <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-bold text-gold">🔒</span>
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

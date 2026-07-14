'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { AuraRing } from '@/art/AuraRing';
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
      <div className="text-center text-lg font-black uppercase text-black mb-4">
        {firstName(you.name, 'You')} <span className="text-[var(--color-comic-red)]">❤</span>{' '}
        {firstName(partner.name, 'Them')}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 flex flex-col items-center"
      >
        <div className="comic-panel mb-6 overflow-hidden rounded-xl border-8 w-full max-w-sm">
          <img src="/results_comic.png" alt="Comic results" className="w-full h-auto object-cover" />
        </div>
      </motion.div>

      <div className="mt-2 rounded-xl border-4 border-black bg-[var(--color-comic-yellow)] p-4 shadow-[6px_6px_0px_#000]">
        <div className="text-sm font-black uppercase tracking-wide text-black">
          ✓ Overall Compatibility — {results.label}
        </div>
        <p className="mt-2 text-sm font-bold leading-relaxed text-black">
          {results.commonThings[0]}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="text-xl">🔒</span>
        <h2 className="text-xl font-black uppercase text-black">Your full reading is ready</h2>
      </div>
      <p
        className="mt-1 text-sm font-black uppercase text-white"
        style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
      >
        Tap to unlock everything below 👇
      </p>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-4 flex flex-col gap-3"
      >
        {locked.map((item) => (
          <motion.button
            key={item.label}
            variants={riseItem}
            onClick={goOffer}
            className="tap relative flex items-center gap-3 overflow-hidden rounded-xl border-4 border-black bg-white px-4 py-3.5 text-left shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="flex-1">
              <span className="block text-[15px] font-black uppercase text-black">{item.label}</span>
              <span className="block select-none text-xs font-bold text-black opacity-30 blur-[3px]">{item.teaser}</span>
            </span>
            <span className="rounded-full border-2 border-black bg-[var(--color-comic-yellow)] px-2 py-1 text-xs font-black text-black">🔒</span>
          </motion.button>
        ))}
      </motion.div>

      <StickyCta caption="Instant access · 💯 money-back promise">
        <Button onClick={goOffer} className="comic-button">
          Unlock Our Full Report →
        </Button>
      </StickyCta>
    </SceneShell>
  );
}

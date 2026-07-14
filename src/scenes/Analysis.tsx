'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { ANALYSIS_BEATS } from '@/content/copy';
import { useQuizStore } from '@/store/useQuizStore';
import { Avatar } from '@/art/Avatar';
import { getZodiac } from '@/engine/zodiac';
import { firstName } from '@/lib/format';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

const BEAT_MS = 1700;

export function Analysis() {
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const compute = useQuizStore((s) => s.compute);
  const results = useQuizStore((s) => s.results);
  const next = useQuizStore((s) => s.next);
  const [i, setI] = useState(0);
  const advanced = useRef(false);
  const total = ANALYSIS_BEATS.length;

  useEffect(() => {
    if (!results) compute(); // safety net
    haptic('reveal');
    const id = setInterval(() => {
      setI((p) => {
        if (p < total - 1) {
          haptic('soft');
          return p + 1;
        }
        return p;
      });
    }, BEAT_MS);
    const finish = setTimeout(() => {
      if (!advanced.current) {
        advanced.current = true;
        track('AnalysisComplete');
        next();
      }
    }, BEAT_MS * total + 700);
    return () => {
      clearInterval(id);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = ((i + 1) / total) * 100;

  return (
    <SceneShell center flush>
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-black uppercase mb-4 text-[var(--color-comic-blue)]">
          Crunching the numbers!
        </h1>
        
        <div className="comic-panel mb-8 overflow-hidden rounded-xl border-8 w-full max-w-[240px]">
          <img src="/analysis_comic.png" alt="Comic analysis" className="w-full h-auto object-cover" />
        </div>

        <div className="flex h-20 items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center bg-white border-4 border-black p-3 rounded-lg shadow-[4px_4px_0px_#000]"
            >
              <span className="text-xl font-bold uppercase text-black">
                {ANALYSIS_BEATS[i].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 h-6 w-64 border-4 border-black bg-white rounded-md overflow-hidden relative shadow-[4px_4px_0px_#000]">
          <motion.div
            className="h-full bg-[var(--color-comic-green)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: BEAT_MS / 1000 }}
          />
        </div>
        <div className="mt-4 text-sm font-bold uppercase tracking-wider text-black">
          Analyzing {firstName(you.name, 'you')} × {firstName(partner.name, 'them')}…
        </div>
      </div>
    </SceneShell>
  );
}

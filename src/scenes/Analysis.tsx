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

  const youSign = getZodiac(you.dob);
  const pSign = getZodiac(partner.dob);
  const progress = ((i + 1) / total) * 100;

  return (
    <SceneShell center flush>
      <div className="flex flex-col items-center text-center">
        <div className="relative flex items-center gap-3">
          <Avatar name={you.name} element={youSign.element} glyph={youSign.glyph} size={84} />
          <motion.span
            animate={{ scale: [1, 1.28, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-4xl"
            style={{ filter: 'drop-shadow(0 0 14px rgba(255,93,143,0.8))' }}
          >
            💞
          </motion.span>
          <Avatar name={partner.name} element={pSign.element} glyph={pSign.glyph} size={84} />
        </div>

        <motion.div
          className="relative mt-9 h-28 w-28"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
        >
          {[0, 1, 2, 3, 4, 5].map((n) => {
            const ang = (n / 6) * Math.PI * 2;
            return (
              <span
                key={n}
                className="anim-twinkle absolute text-lg"
                style={{
                  left: `${50 + Math.cos(ang) * 46}%`,
                  top: `${50 + Math.sin(ang) * 46}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {n % 2 ? '✨' : '❤️'}
              </span>
            );
          })}
          <span
            className="anim-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
            style={{ filter: 'drop-shadow(0 0 16px rgba(255,210,125,0.8))' }}
          >
            🔮
          </span>
        </motion.div>

        <div className="mt-9 flex h-20 items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <span className="text-3xl">{ANALYSIS_BEATS[i].icon}</span>
              <span className="mt-2 px-6 text-lg font-semibold text-starlight">
                {ANALYSIS_BEATS[i].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 h-2 w-56 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="cta-gradient h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: BEAT_MS / 1000 }}
          />
        </div>
        <div className="mt-2 text-xs text-muted">
          Analyzing {firstName(you.name, 'you')} × {firstName(partner.name, 'them')}…
        </div>
      </div>
    </SceneShell>
  );
}

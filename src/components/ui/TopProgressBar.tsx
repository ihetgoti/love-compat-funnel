'use client';

import { motion } from 'framer-motion';
import { ROMANCE_EASE } from '@/design/motion';

interface TopProgressBarProps {
  progress: number; // 0..100
  onBack?: () => void;
  canBack?: boolean;
}

/** Heart-trail progress bar fixed at the top, with an optional back affordance. */
export function TopProgressBar({ progress, onBack, canBack }: TopProgressBarProps) {
  return (
    <div className="safe-top fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 pt-3">
        {canBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="tap -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-starlight/80 active:scale-90"
          >
            ‹
          </button>
        ) : null}
        <div className="relative h-2.5 flex-1 overflow-visible rounded-full bg-white/10">
          <motion.div
            className="cta-gradient relative h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
            transition={{ duration: 0.6, ease: ROMANCE_EASE }}
          >
            <span
              className="anim-glow absolute -right-1 top-1/2 -translate-y-1/2 text-[13px] leading-none"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,93,143,0.9))' }}
            >
              ❤️
            </span>
          </motion.div>
        </div>
        <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-starlight/70">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

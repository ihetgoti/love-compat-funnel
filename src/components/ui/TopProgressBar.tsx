'use client';

import { motion } from 'framer-motion';
import { ROMANCE_EASE } from '@/design/motion';

interface TopProgressBarProps {
  progress: number; // 0..100
  onBack?: () => void;
  canBack?: boolean;
}

export function TopProgressBar({ progress, onBack, canBack }: TopProgressBarProps) {
  return (
    <div className="safe-top fixed inset-x-0 top-0 z-40 bg-white border-b-4 border-black">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-2">
        {canBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="comic-button tap -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-black text-black"
          >
            ‹
          </button>
        ) : null}
        <div className="relative h-4 flex-1 overflow-visible rounded-sm bg-white border-4 border-black shadow-[2px_2px_0px_#000]">
          <motion.div
            className="relative h-full bg-[var(--color-comic-green)]"
            initial={false}
            animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
            transition={{ duration: 0.6, ease: ROMANCE_EASE }}
          />
        </div>
        <span className="w-10 shrink-0 text-right text-sm font-black tabular-nums text-black">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

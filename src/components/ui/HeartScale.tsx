'use client';

import { motion } from 'framer-motion';
import { haptic } from '@/design/haptics';

interface HeartScaleProps {
  value: number; // 0 = unset, 1..5
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export function HeartScale({ value, onChange, lowLabel, highLabel }: HeartScaleProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= value;
          return (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.82 }}
              onClick={() => {
                haptic('select');
                onChange(n);
              }}
              aria-label={`${n} out of 5`}
              className="tap relative p-1.5"
            >
              <motion.span
                animate={{ scale: filled ? 1.15 : 1, opacity: filled ? 1 : 0.6 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                className="block text-[2.6rem] leading-none transition-all duration-300"
                style={filled ? { filter: 'drop-shadow(0 0 12px rgba(255,93,143,0.8))' } : { filter: 'grayscale(0.5)' }}
              >
                ❤️
              </motion.span>
              {filled && <span className="absolute inset-0 bg-rose/30 rounded-full blur-xl anim-glow" />}
            </motion.button>
          );
        })}
      </div>
      {lowLabel || highLabel ? (
        <div className="mt-3 flex justify-between px-2 text-xs font-bold uppercase tracking-wider text-muted">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

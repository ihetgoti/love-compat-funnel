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
              className="tap p-1.5"
            >
              <motion.span
                animate={{ scale: filled ? 1.12 : 1, opacity: filled ? 1 : 0.45 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                className="block text-[2.6rem] leading-none"
                style={filled ? { filter: 'drop-shadow(0 0 10px rgba(255,93,143,0.7))' } : undefined}
              >
                {filled ? '❤️' : '🤍'}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      {lowLabel || highLabel ? (
        <div className="mt-2 flex justify-between px-2 text-xs font-medium text-muted">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

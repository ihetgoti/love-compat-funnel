'use client';

import { motion } from 'framer-motion';
import { haptic } from '@/design/haptics';
import { cn } from '@/lib/cn';

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
                animate={{ scale: filled ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                className={cn(
                  "block text-[2.6rem] leading-none transition-all",
                  filled ? "" : "opacity-60 grayscale"
                )}
                style={{ filter: 'drop-shadow(3px 3px 0px #000)' }}
              >
                ❤️
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      {lowLabel || highLabel ? (
        <div className="mt-4 flex justify-between px-2 text-sm font-black uppercase tracking-wider text-black">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { bubblePop } from '@/design/motion';
import { cn } from '@/lib/cn';

const BUBBLE_BG = 'rgba(36,18,64,0.94)';

interface SpeechBubbleProps {
  children: React.ReactNode;
  tail?: 'left' | 'right' | 'bottom' | 'none';
  className?: string;
}

/** Comic-style speech bubble with a directional tail. */
export function SpeechBubble({ children, tail = 'bottom', className }: SpeechBubbleProps) {
  return (
    <motion.div
      variants={bubblePop}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'relative rounded-3xl border border-white/14 px-4 py-3 text-[15px] font-semibold leading-snug text-starlight shadow-[0_12px_36px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl',
        className,
      )}
      style={{ background: BUBBLE_BG }}
    >
      {children}
      {tail !== 'none' && (
        <span
          aria-hidden
          className={cn(
            'absolute h-0 w-0',
            tail === 'bottom' && 'bottom-[-10px] left-1/2 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[11px] border-l-transparent border-r-transparent',
            tail === 'left' && 'left-[-10px] top-7 border-b-[9px] border-r-[11px] border-t-[9px] border-b-transparent border-t-transparent',
            tail === 'right' && 'right-[-10px] top-7 border-b-[9px] border-l-[11px] border-t-[9px] border-b-transparent border-t-transparent',
          )}
          style={
            tail === 'bottom'
              ? { borderTopColor: BUBBLE_BG }
              : tail === 'left'
                ? { borderRightColor: BUBBLE_BG }
                : { borderLeftColor: BUBBLE_BG }
          }
        />
      )}
    </motion.div>
  );
}

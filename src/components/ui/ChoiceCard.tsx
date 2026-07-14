'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { haptic } from '@/design/haptics';
import { popItem } from '@/design/motion';

interface ChoiceCardProps {
  emoji?: string;
  label: string;
  subtitle?: string;
  selected?: boolean;
  onSelect: () => void;
  layout?: 'row' | 'tile';
  className?: string;
}

/** Large, satisfying tappable option. Used for the relationship grid (tiles)
 *  and quiz answers (rows). Animates in via a parent stagger container. */
export function ChoiceCard({
  emoji,
  label,
  subtitle,
  selected,
  onSelect,
  layout = 'row',
  className,
}: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      variants={popItem}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        haptic('select');
        onSelect();
      }}
      className={cn(
        'tap relative overflow-hidden rounded-3xl border backdrop-blur-md transition-colors',
        selected
          ? 'border-gold/80 bg-white/[0.13] shadow-[0_12px_44px_-10px_rgba(245,181,74,0.55)]'
          : 'border-white/12 bg-white/[0.055]',
        layout === 'row' ? 'flex w-full items-center gap-4 px-4 py-4' : 'flex flex-col items-center gap-2 px-3 py-5',
        className,
      )}
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(255,210,125,0.16), transparent 70%)' }}
        />
      )}
      {emoji ? (
        <span className={cn('relative leading-none', layout === 'tile' ? 'text-[2.6rem]' : 'text-3xl')}>
          {emoji}
        </span>
      ) : null}
      <span className={cn('relative flex-1', layout === 'tile' && 'text-center')}>
        <span
          className={cn(
            'block font-bold text-starlight',
            layout === 'tile' ? 'text-[15px] leading-tight' : 'text-[17px]',
          )}
        >
          {label}
        </span>
        {subtitle ? <span className="mt-0.5 block text-xs text-muted">{subtitle}</span> : null}
      </span>
      <AnimatePresence>
        {selected ? (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-xs font-black text-night',
              layout === 'tile' && 'absolute right-2.5 top-2.5',
            )}
          >
            ✓
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

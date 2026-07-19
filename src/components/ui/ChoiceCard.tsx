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
        <span className={cn(
          'relative flex items-center justify-center rounded-full',
          layout === 'tile' ? 'w-16 h-16 text-3xl mb-1' : 'w-12 h-12 text-2xl',
          selected 
            ? 'bg-gradient-to-br from-white/20 to-white/5 shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/30' 
            : 'bg-white/5 border border-white/10'
        )}>
          <span className="relative z-10 anim-float" style={{ animationDuration: '6s' }}>{emoji}</span>
          {selected && (
            <span className="absolute inset-0 rounded-full bg-rose/20 blur-md anim-glow" />
          )}
        </span>
      ) : null}
      <span className={cn('relative flex-1', layout === 'tile' && 'text-center')}>
        <span
          className={cn(
            'block font-bold text-starlight transition-all duration-300',
            layout === 'tile' ? 'text-[15px] leading-tight' : 'text-[17px]',
            selected ? 'text-shadow-sm shadow-white/50' : ''
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

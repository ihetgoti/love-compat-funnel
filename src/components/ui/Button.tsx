'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { haptic } from '@/design/haptics';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  fullWidth?: boolean;
  glow?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = true,
  glow = true,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={(e) => {
        haptic('tap');
        onClick?.(e);
      }}
      className={cn(
        'tap relative inline-flex min-h-[56px] items-center justify-center gap-2 rounded-pill px-6 py-4 text-center text-base font-bold tracking-tight',
        fullWidth && 'w-full',
        variant === 'primary' && 'cta-gradient text-white',
        variant === 'primary' && glow && 'shadow-[0_14px_44px_-10px_rgba(255,93,143,0.65)]',
        variant === 'gold' && 'bg-gradient-to-r from-gold to-gold-deep text-night',
        variant === 'gold' && glow && 'shadow-[0_14px_44px_-10px_rgba(245,181,74,0.6)]',
        variant === 'secondary' && 'glass text-starlight',
        variant === 'ghost' && 'text-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

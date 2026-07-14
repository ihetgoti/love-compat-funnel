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
  layout?: 'row' | 'tile' | 'image';
  bgImage?: string;
  className?: string;
}

export function ChoiceCard({
  emoji,
  label,
  subtitle,
  selected,
  onSelect,
  layout = 'row',
  bgImage,
  className,
}: ChoiceCardProps) {
  // If there's a background image, we render a highly visual panel but keep text extremely legible.
  const isImage = !!bgImage;

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
        'tap relative overflow-hidden transition-all duration-100',
        'border-4 border-black text-black',
        selected
          ? 'bg-[#ffcc00] shadow-[0px_0px_0px_#000] translate-x-[4px] translate-y-[4px]'
          : 'bg-white shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000]',
        !isImage && layout === 'row' ? 'flex w-full items-center gap-4 px-4 py-4' : '',
        !isImage && layout === 'tile' ? 'flex flex-col items-center gap-2 px-3 py-5' : '',
        isImage ? 'flex flex-col justify-end p-4 h-48 w-full' : '',
        className,
      )}
      style={isImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {isImage ? (
        <div className="relative z-10 flex w-full flex-col bg-white border-4 border-black p-2 mt-auto">
          {emoji && <span className="mb-1 text-2xl">{emoji}</span>}
          <span className="font-display text-[17px] font-black text-black uppercase">{label}</span>
        </div>
      ) : (
        <>
          {emoji ? (
            <span className={cn('relative leading-none', layout === 'tile' ? 'text-[2.6rem]' : 'text-3xl')}>
              {emoji}
            </span>
          ) : null}
          <span className={cn('relative flex-1', layout === 'tile' && 'text-center')}>
            <span
              className={cn(
                'block font-black uppercase text-black',
                layout === 'tile' ? 'text-[15px] leading-tight' : 'text-[17px]',
              )}
            >
              {label}
            </span>
            {subtitle ? <span className="mt-0.5 block text-xs font-bold text-black opacity-80">{subtitle}</span> : null}
          </span>
        </>
      )}

      <AnimatePresence>
        {selected ? (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-black text-white font-black text-sm z-20',
              (layout === 'tile' || isImage) ? 'absolute right-2 top-2' : '',
            )}
          >
            ✓
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

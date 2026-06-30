'use client';

import { motion } from 'framer-motion';
import { Mascot, type MascotName } from './Mascot';
import { SpeechBubble } from './SpeechBubble';
import { cn } from '@/lib/cn';

interface MascotBeatProps {
  mascot: MascotName;
  mood?: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
  size?: number;
  className?: string;
}

/** A mascot + speech bubble pairing for inline comic delight moments. */
export function MascotBeat({
  mascot,
  mood,
  children,
  align = 'left',
  size = 74,
  className,
}: MascotBeatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={cn('flex items-end gap-2', align === 'right' && 'flex-row-reverse', className)}
    >
      <Mascot name={mascot} mood={mood} size={size} />
      <SpeechBubble tail={align === 'right' ? 'right' : 'left'} className="max-w-[15.5rem]">
        {children}
      </SpeechBubble>
    </motion.div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { haptic } from '@/design/haptics';

const ITEM_H = 44;
const VISIBLE = 5; // odd number of rows
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

export interface WheelItem {
  value: number;
  label: string;
}

interface WheelColumnProps {
  items: WheelItem[];
  index: number;
  onIndexChange: (i: number) => void;
  ariaLabel: string;
  fadeColor?: string;
  className?: string;
}

/** A single scroll-snapping wheel column (iOS-style), with haptic ticks. */
export function WheelColumn({
  items,
  index,
  onIndexChange,
  ariaLabel,
  fadeColor = '#1a1030',
  className,
}: WheelColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const lastIdx = useRef(index);
  const [active, setActive] = useState(index);

  // Keep scroll position in sync when the selected index changes externally
  // (e.g. day count shrinks when the month changes).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
    lastIdx.current = index;
    setActive(index);
  }, [index, items.length]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      if (i !== lastIdx.current) {
        lastIdx.current = i;
        setActive(i);
        haptic('soft');
        onIndexChange(i);
      }
    });
  }, [items.length, onIndexChange]);

  return (
    <div className={cn('relative', className)} style={{ height: VISIBLE * ITEM_H }} aria-label={ariaLabel}>
      <div
        className="pointer-events-none absolute inset-x-1 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-gold/40 bg-white/[0.06]"
        style={{ height: ITEM_H }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll"
      >
        <div style={{ height: PAD }} />
        {items.map((it, i) => {
          const isActive = i === active;
          const dist = Math.abs(i - active);
          return (
            <div
              key={it.value}
              className="flex snap-center items-center justify-center"
              style={{ height: ITEM_H }}
            >
              <span
                className={cn(
                  'transition-all duration-150',
                  isActive ? 'text-xl font-bold text-starlight' : 'font-medium text-muted',
                )}
                style={{ opacity: isActive ? 1 : Math.max(0.25, 0.7 - dist * 0.18) }}
              >
                {it.label}
              </span>
            </div>
          );
        })}
        <div style={{ height: PAD }} />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2"
        style={{ background: `linear-gradient(to bottom, ${fadeColor}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2"
        style={{ background: `linear-gradient(to top, ${fadeColor}, transparent)` }}
      />
    </div>
  );
}

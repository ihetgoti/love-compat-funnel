'use client';

import { useEffect, useState } from 'react';

interface AuraRingProps {
  score: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  duration?: number;
}

/** Animated compatibility ring with a count-up number. Honors reduced motion. */
export function AuraRing({ score, size = 210, stroke = 14, label, sub, duration = 1500 }: AuraRingProps) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = reduce ? 1 : Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(score * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, duration]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - val / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="aura-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5d8f" />
            <stop offset="55%" stopColor="#ffd27d" />
            <stop offset="100%" stopColor="#c9a7ff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#aura-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,93,143,0.55))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="romance-text text-glow font-display text-[3.4rem] font-extrabold leading-none">
          {Math.round(val)}%
        </span>
        {label ? <span className="mt-1.5 text-sm font-bold text-blush">{label}</span> : null}
        {sub ? <span className="mt-0.5 text-xs text-muted">{sub}</span> : null}
      </div>
    </div>
  );
}

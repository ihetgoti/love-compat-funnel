'use client';

import { useMemo } from 'react';

/** Deterministic 0..1 from an index — keeps SSR and client markup identical. */
function pseudo(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface ParticlesProps {
  count?: number;
  variant?: 'sparkles' | 'hearts' | 'mixed';
}

/** Ambient twinkling/floating particle field. Pure CSS animation, pointer-safe. */
export function Particles({ count = 14, variant = 'sparkles' }: ParticlesProps) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = pseudo(i) * 100;
        const top = pseudo(i + 53) * 100;
        const size = 7 + pseudo(i + 17) * 15;
        const delay = pseudo(i + 7) * 5;
        const dur = 3 + pseudo(i + 31) * 4;
        const glyph =
          variant === 'hearts' ? '❤' : variant === 'mixed' ? (i % 3 === 0 ? '❤' : '✦') : '✦';
        const color =
          glyph === '❤'
            ? 'rgba(255,150,180,0.85)'
            : i % 2 === 0
              ? 'rgba(255,210,125,0.9)'
              : 'rgba(255,244,251,0.85)';
        return { i, left, top, size, delay, dur, glyph, color };
      }),
    [count, variant],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p) => (
        <span
          key={p.i}
          className="anim-twinkle absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            textShadow: '0 0 8px currentColor',
            willChange: 'transform, opacity',
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

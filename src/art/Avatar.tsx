'use client';

import { cn } from '@/lib/cn';
import { elementColors, type ZodiacElement } from '@/design/tokens';

interface AvatarProps {
  name: string;
  element?: ZodiacElement;
  glyph?: string;
  size?: number;
  accent?: string; // override gradient base color
  className?: string;
  ring?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '♥';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Runtime avatar from initials + an elemental aura + optional zodiac glyph. */
export function Avatar({ name, element = 'water', glyph, size = 92, accent, className, ring = true }: AvatarProps) {
  const base = accent ?? elementColors[element];
  return (
    <div
      className={cn('relative grid place-items-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 28%, ${base}, rgba(20,12,38,0.9) 78%)`,
        boxShadow: ring
          ? `0 0 0 2px rgba(255,255,255,0.18), 0 12px 34px -10px ${base}`
          : undefined,
      }}
    >
      <span className="font-display font-extrabold text-starlight" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </span>
      {glyph ? (
        <span
          className="absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-night-2 text-gold shadow-md"
          style={{ width: size * 0.34, height: size * 0.34, fontSize: size * 0.2 }}
        >
          {glyph}
        </span>
      ) : null}
    </div>
  );
}

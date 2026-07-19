'use client';

import { cn } from '@/lib/cn';
import { elementColors, type ZodiacElement } from '@/design/tokens';

import { type Gender } from '@/engine/types';

interface AvatarProps {
  name: string;
  gender?: Gender;
  dob?: string | null;
  element?: ZodiacElement;
  glyph?: string;
  size?: number;
  accent?: string;
  className?: string;
  ring?: boolean;
}

function getAgeGroup(dob?: string | null): 'young' | 'adult' | 'senior' {
  if (!dob) return 'young';
  const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 30) return 'young';
  if (age < 50) return 'adult';
  return 'senior';
}

function getFace(gender?: Gender, dob?: string | null): string {
  // Only male/female/neutral face files exist — everything else uses neutral.
  const g = gender === 'male' || gender === 'female' ? gender : 'neutral';
  const ageGroup = getAgeGroup(dob);
  return `/avatar_${g}_${ageGroup}.svg`;
}

/** Runtime avatar from a premium age/gender SVG face + an elemental aura + optional zodiac glyph. */
export function Avatar({ name, gender, dob, element = 'water', glyph, size = 92, accent, className, ring = true }: AvatarProps) {
  const base = accent ?? elementColors[element];
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Inner container for background and image clipping */}
      <div 
        className="absolute inset-0 rounded-full grid place-items-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 35% 28%, ${base}, rgba(20,12,38,0.9) 78%)`,
          boxShadow: ring
            ? `0 0 0 2px rgba(255,255,255,0.18), 0 12px 34px -10px ${base}`
            : undefined,
        }}
      >
        <img 
          src={getFace(gender, dob)} 
          alt="Avatar" 
          className="object-cover relative z-10" 
          style={{ width: size * 0.95, height: size * 0.95, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))', transform: 'translateY(4%)' }} 
        />
      </div>

      {/* Zodiac glyph remains outside the overflow-hidden container */}
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

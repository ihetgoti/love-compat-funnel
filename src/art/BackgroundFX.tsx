'use client';

import { Particles } from './Particles';
import { useIsClient } from '@/lib/useIsClient';

type Intensity = 'calm' | 'normal' | 'intense';

interface BackgroundFXProps {
  intensity?: Intensity;
}

/** Full-screen animated romantic backdrop: drifting aurora blobs + sparkles.
 *  Client-only (its randomized inline styles must not be hydration-compared).
 *  The body's CSS gradient covers the first paint, so there's no flash. */
export function BackgroundFX({ intensity = 'normal' }: BackgroundFXProps) {
  const isClient = useIsClient();
  const sparkleCount = intensity === 'intense' ? 22 : intensity === 'calm' ? 9 : 14;

  if (!isClient) return <div aria-hidden className="fixed inset-0 -z-10" />;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <Blob
        className="-left-[20%] -top-[15%] h-[65vh] w-[65vh]"
        color="rgba(255,93,143,0.42)"
        duration={20}
        delay={0}
      />
      <Blob
        className="-right-[25%] top-[10%] h-[60vh] w-[60vh]"
        color="rgba(201,167,255,0.32)"
        duration={26}
        delay={-6}
      />
      <Blob
        className="bottom-[-20%] left-[10%] h-[70vh] w-[70vh]"
        color="rgba(138,215,255,0.22)"
        duration={30}
        delay={-12}
      />
      {intensity === 'intense' && (
        <Blob
          className="bottom-[5%] right-[0%] h-[55vh] w-[55vh]"
          color="rgba(255,210,125,0.3)"
          duration={22}
          delay={-3}
        />
      )}

      {/* subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(10,6,24,0.55) 100%)',
        }}
      />

      <Particles count={sparkleCount} variant={intensity === 'intense' ? 'mixed' : 'sparkles'} />
    </div>
  );
}

function Blob({
  className,
  color,
  duration,
  delay,
}: {
  className: string;
  color: string;
  duration: number;
  delay: number;
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
        animation: `aurora-drift ${duration}s ease-in-out ${delay}s infinite`,
        willChange: 'transform',
      }}
    />
  );
}

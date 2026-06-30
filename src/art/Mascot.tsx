'use client';

import { cn } from '@/lib/cn';

export type MascotName = 'cupid' | 'matchmaker' | 'fortuneCat';

interface MascotProps {
  name: MascotName;
  mood?: string;
  size?: number;
  float?: boolean;
  className?: string;
}

/**
 * Runtime, code-drawn mascots (no image assets, no AI). Each is a parametric
 * SVG whose eyes/mouth/props respond to `mood`. Swappable behind this component.
 */
export function Mascot({ name, mood = 'happy', size = 96, float = true, className }: MascotProps) {
  return (
    <div
      className={cn(float && 'anim-float', className)}
      style={{ width: size, height: size, filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.35))' }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${name} mascot`}>
        {name === 'cupid' && <Cupid mood={mood} />}
        {name === 'matchmaker' && <Matchmaker mood={mood} />}
        {name === 'fortuneCat' && <FortuneCat mood={mood} />}
      </svg>
    </div>
  );
}

const blinkStyle: React.CSSProperties = {
  animation: 'blink 5.5s ease-in-out infinite',
  transformBox: 'fill-box',
  transformOrigin: 'center',
};

/* ----------------------------------- Cupid ----------------------------------- */
function Cupid({ mood }: { mood: string }) {
  const wink = mood === 'wink';
  const gasp = mood === 'gasp' || mood === 'wow';
  const cheer = mood === 'cheer';
  return (
    <g>
      <defs>
        <radialGradient id="cupid-skin" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffe3d0" />
          <stop offset="100%" stopColor="#ffc6a8" />
        </radialGradient>
        <linearGradient id="cupid-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffd9e6" />
        </linearGradient>
      </defs>
      {/* wings */}
      <path d="M38 60c-18-12-30-6-30 4 0 9 12 13 26 8" fill="url(#cupid-wing)" opacity="0.95" />
      <path d="M82 60c18-12 30-6 30 4 0 9-12 13-26 8" fill="url(#cupid-wing)" opacity="0.95" />
      {/* body */}
      <ellipse cx="60" cy="86" rx="20" ry="16" fill="url(#cupid-skin)" />
      {/* head */}
      <circle cx="60" cy="50" r="26" fill="url(#cupid-skin)" />
      {/* hair */}
      <path d="M36 44c2-16 16-24 24-24s22 8 24 24c-6-8-16-10-24-10s-18 2-24 10z" fill="#f7c873" />
      {/* cheeks */}
      <circle cx="46" cy="56" r="5" fill="#ff9bb4" opacity="0.7" />
      <circle cx="74" cy="56" r="5" fill="#ff9bb4" opacity="0.7" />
      {/* eyes */}
      {wink ? (
        <>
          <path d="M44 49c2-3 7-3 9 0" stroke="#3a2237" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="72" cy="49" r="4" fill="#3a2237" style={blinkStyle} />
        </>
      ) : (
        <>
          <circle cx="48" cy="49" r={gasp ? 5 : 4} fill="#3a2237" style={blinkStyle} />
          <circle cx="72" cy="49" r={gasp ? 5 : 4} fill="#3a2237" style={blinkStyle} />
          <circle cx="49.5" cy="47.5" r="1.4" fill="#fff" />
          <circle cx="73.5" cy="47.5" r="1.4" fill="#fff" />
        </>
      )}
      {/* mouth */}
      {gasp ? (
        <ellipse cx="60" cy="62" rx="4" ry="5" fill="#7a3a4f" />
      ) : cheer ? (
        <path d="M52 60c4 6 12 6 16 0" stroke="#7a3a4f" strokeWidth="3" fill="#ffd9e6" strokeLinecap="round" />
      ) : (
        <path d="M53 60c3 4 11 4 14 0" stroke="#7a3a4f" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {/* glowing heart arrow */}
      <g className="anim-glow">
        <path d="M96 80c0-4-6-5-7-1-1-4-7-3-7 1 0 4 7 7 7 7s7-3 7-7z" fill="#ff5d8f" />
      </g>
    </g>
  );
}

/* -------------------------------- Matchmaker -------------------------------- */
function Matchmaker({ mood }: { mood: string }) {
  const reveal = mood === 'reveal' || mood === 'wow';
  const ponder = mood === 'ponder';
  return (
    <g>
      <defs>
        <linearGradient id="mm-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2772" />
          <stop offset="100%" stopColor="#160d28" />
        </linearGradient>
        <radialGradient id="mm-orb" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fff4fb" />
          <stop offset="45%" stopColor="#ff8fb4" />
          <stop offset="100%" stopColor="#ffd27d" />
        </radialGradient>
        <radialGradient id="mm-face" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#f2d2bd" />
          <stop offset="100%" stopColor="#e0b69c" />
        </radialGradient>
      </defs>
      {/* cloak */}
      <path d="M60 30c-22 0-34 18-34 54h68c0-36-12-54-34-54z" fill="url(#mm-cloak)" />
      {/* stars on cloak */}
      <circle cx="44" cy="74" r="1.6" fill="#ffe9b0" className="anim-twinkle" />
      <circle cx="74" cy="70" r="1.4" fill="#ffe9b0" className="anim-twinkle" />
      <circle cx="60" cy="84" r="1.6" fill="#fff" className="anim-twinkle" />
      <circle cx="52" cy="64" r="1.2" fill="#c9a7ff" className="anim-twinkle" />
      {/* hood */}
      <path d="M60 18c-16 0-26 12-26 26 0 6 4 9 8 9 0-14 8-22 18-22s18 8 18 22c4 0 8-3 8-9 0-14-10-26-26-26z" fill="#5a3486" />
      {/* face */}
      <circle cx="60" cy="48" r="17" fill="url(#mm-face)" />
      {/* constellation freckles */}
      <circle cx="52" cy="50" r="1" fill="#a06bd6" />
      <circle cx="68" cy="50" r="1" fill="#a06bd6" />
      <circle cx="60" cy="55" r="1" fill="#a06bd6" />
      {/* eyes */}
      {ponder ? (
        <>
          <path d="M50 47c2-2 6-2 8 0" stroke="#2a1840" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M62 47c2-2 6-2 8 0" stroke="#2a1840" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="54" cy="47" r={reveal ? 4 : 3.2} fill="#2a1840" style={blinkStyle} />
          <circle cx="66" cy="47" r={reveal ? 4 : 3.2} fill="#2a1840" style={blinkStyle} />
          <circle cx="55" cy="46" r="1.1" fill="#fff" />
          <circle cx="67" cy="46" r="1.1" fill="#fff" />
        </>
      )}
      {/* mouth */}
      <path d={reveal ? 'M55 56c3 4 7 4 10 0' : 'M56 56c2 2 6 2 8 0'} stroke="#7a3a4f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* glowing orb */}
      <g className="anim-glow">
        <circle cx="60" cy="92" r="11" fill="url(#mm-orb)" />
        <circle cx="60" cy="92" r="11" fill="none" stroke="#fff" strokeOpacity="0.4" />
      </g>
    </g>
  );
}

/* -------------------------------- Fortune Cat ------------------------------- */
function FortuneCat({ mood }: { mood: string }) {
  const giggle = mood === 'giggle' || mood === 'cheer';
  const surprised = mood === 'surprised' || mood === 'wow';
  return (
    <g>
      <defs>
        <radialGradient id="cat-body" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#fffaf2" />
          <stop offset="100%" stopColor="#ffe9d4" />
        </radialGradient>
      </defs>
      {/* paw up (waving) */}
      <g className="anim-float">
        <ellipse cx="92" cy="58" rx="9" ry="11" fill="url(#cat-body)" stroke="#f0d4b8" />
      </g>
      {/* body */}
      <ellipse cx="60" cy="84" rx="26" ry="22" fill="url(#cat-body)" />
      {/* head */}
      <circle cx="60" cy="50" r="28" fill="url(#cat-body)" />
      {/* ears */}
      <path d="M36 30l-2-16 18 8z" fill="url(#cat-body)" stroke="#f0d4b8" />
      <path d="M84 30l2-16-18 8z" fill="url(#cat-body)" stroke="#f0d4b8" />
      <path d="M38 24l-1-7 8 4z" fill="#ffb3c8" />
      <path d="M82 24l1-7-8 4z" fill="#ffb3c8" />
      {/* cheeks */}
      <circle cx="44" cy="56" r="5" fill="#ffc2d2" opacity="0.7" />
      <circle cx="76" cy="56" r="5" fill="#ffc2d2" opacity="0.7" />
      {/* eyes */}
      {giggle ? (
        <>
          <path d="M44 49c2-3 8-3 10 0" stroke="#2a1840" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M66 49c2-3 8-3 10 0" stroke="#2a1840" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="49" cy="49" rx={surprised ? 4 : 3.4} ry={surprised ? 5.5 : 4.6} fill="#2a1840" style={blinkStyle} />
          <ellipse cx="71" cy="49" rx={surprised ? 4 : 3.4} ry={surprised ? 5.5 : 4.6} fill="#2a1840" style={blinkStyle} />
          <circle cx="50.4" cy="47.4" r="1.2" fill="#fff" />
          <circle cx="72.4" cy="47.4" r="1.2" fill="#fff" />
        </>
      )}
      {/* nose + mouth */}
      <path d="M58 57h4l-2 2z" fill="#ff8fab" />
      <path d={surprised ? 'M60 60a4 4 0 100 6' : 'M54 60c3 4 9 4 12 0'} stroke="#a05a6e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* collar + coin */}
      <path d="M40 70c8 8 32 8 40 0" stroke="#f5b54a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g className="anim-glow">
        <circle cx="60" cy="76" r="7" fill="#ffd27d" stroke="#f5b54a" strokeWidth="1.5" />
        <text x="60" y="79" textAnchor="middle" fontSize="7" fill="#a8770f" fontWeight="bold">福</text>
      </g>
    </g>
  );
}

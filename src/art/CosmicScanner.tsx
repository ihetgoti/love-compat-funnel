'use client';

import { motion } from 'framer-motion';

export function CosmicScanner({ size = 160 }: { size?: number }) {
  const r = size / 2;
  return (
    <div className="relative flex items-center justify-center my-6" style={{ width: size, height: size }}>
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full bg-rose/10 blur-2xl anim-glow" />

      {/* Complex Geometric Rings */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <defs>
          <linearGradient id="scan-grad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5d8f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffd27d" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="scan-grad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ad7ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c9a7ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Ring 1 - Dashed */}
        <motion.circle
          cx={r}
          cy={r}
          r={r - 4}
          stroke="url(#scan-grad1)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 8"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Outer Ring 2 - Opposite rotation */}
        <motion.circle
          cx={r}
          cy={r}
          r={r - 12}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="40 120"
          strokeLinecap="round"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Inner Ring - Solid thin */}
        <motion.circle
          cx={r}
          cy={r}
          r={r - 24}
          stroke="url(#scan-grad2)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="60 40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Radar Sweep Line */}
        <motion.line
          x1={r}
          y1={r}
          x2={r}
          y2={16}
          stroke="url(#scan-grad1)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Center Node */}
        <circle cx={r} cy={r} r={4} fill="#fff" className="anim-twinkle" style={{ filter: 'drop-shadow(0 0 8px #ff5d8f)' }} />
      </svg>
    </div>
  );
}

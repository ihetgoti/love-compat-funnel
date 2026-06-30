'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SceneShell } from '@/components/ui/SceneShell';
import { StickyCta } from '@/components/ui/StickyCta';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { generateShareCard } from '@/art/ShareCard';
import { firstName } from '@/lib/format';
import { riseItem, staggerContainer } from '@/design/motion';
import { track } from '@/analytics/track';
import { haptic } from '@/design/haptics';

export function ShareExperience() {
  const results = useQuizStore((s) => s.results);
  const you = useQuizStore((s) => s.you);
  const partner = useQuizStore((s) => s.partner);
  const incShare = useQuizStore((s) => s.incShare);
  const reset = useQuizStore((s) => s.reset);
  const [img, setImg] = useState('');

  useEffect(() => {
    if (!results) return;
    let cancelled = false;
    // Defer the canvas draw off the effect body (keeps first paint snappy).
    const id = requestAnimationFrame(() => {
      if (cancelled) return;
      try {
        setImg(
          generateShareCard({
            youName: firstName(you.name, 'You'),
            partnerName: firstName(partner.name, 'Them'),
            score: results.score,
            label: results.label,
            tagline: results.tagline,
          }),
        );
      } catch {
        /* canvas unavailable — skip preview */
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [results, you.name, partner.name]);

  const download = () => {
    if (!img) return;
    const a = document.createElement('a');
    a.href = img;
    a.download = 'our-love-match.png';
    a.click();
  };

  const share = async () => {
    haptic('success');
    incShare();
    track('Share');
    const text = `We’re a ${results?.score ?? 92}% match 💞 Check yours!`;
    try {
      if (img && typeof navigator !== 'undefined' && 'canShare' in navigator) {
        const blob = await (await fetch(img)).blob();
        const file = new File([blob], 'our-love-match.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Our Love Match 💞', text });
          return;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Our Love Match 💞', text, url: window.location.href });
        return;
      }
      download();
    } catch {
      /* user cancelled or unsupported */
    }
  };

  return (
    <SceneShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col items-center text-center">
        <motion.h1 variants={riseItem} className="text-[1.7rem] font-extrabold leading-tight">
          You two are a{' '}
          <span className="romance-text">{results?.score ?? 92}% match</span>! 💞
        </motion.h1>
        <motion.p variants={riseItem} className="mt-1.5 text-sm text-muted">
          Share your result — and challenge your match to check theirs 👀
        </motion.p>

        <motion.div
          variants={riseItem}
          className="mt-5 w-[16rem] overflow-hidden rounded-3xl border border-white/15 shadow-[0_20px_60px_-16px_rgba(0,0,0,0.7)]"
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Your shareable love match card" className="block w-full" />
          ) : (
            <div className="aspect-[9/16] w-full animate-pulse bg-white/10" />
          )}
        </motion.div>

        <motion.div variants={riseItem} className="mt-4 flex gap-3 text-xs font-semibold text-muted">
          <span>📸 1.2M shared</span>
          <span>·</span>
          <span>💌 Tag your match</span>
        </motion.div>
      </motion.div>

      <StickyCta
        caption={
          <button
            onClick={() => {
              haptic('tap');
              reset();
            }}
            className="tap underline-offset-2 hover:underline"
          >
            ↺ Check another match
          </button>
        }
      >
        <div className="flex flex-col gap-2.5">
          <Button variant="primary" onClick={share}>
            Share Our Match 💞
          </Button>
          <Button variant="secondary" glow={false} onClick={download}>
            Save image
          </Button>
        </div>
      </StickyCta>
    </SceneShell>
  );
}

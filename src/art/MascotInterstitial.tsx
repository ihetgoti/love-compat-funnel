'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mascot, type MascotName } from './Mascot';
import { SpeechBubble } from './SpeechBubble';
import { Particles } from './Particles';
import { haptic } from '@/design/haptics';

interface MascotInterstitialProps {
  show: boolean;
  mascot: MascotName;
  mood?: string;
  message: React.ReactNode;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

/**
 * A full-screen comic interstitial. Covers the whole screen, then dismisses
 * itself after `duration` (default 3s) OR as soon as the user taps anywhere.
 * `onDismiss` fires exactly once per appearance.
 */
export function MascotInterstitial({
  show,
  mascot,
  mood,
  message,
  onDismiss,
  duration = 3000,
}: MascotInterstitialProps) {
  const done = useRef(false);

  useEffect(() => {
    if (!show) {
      done.current = false;
      return;
    }
    haptic('reveal');
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDismiss();
      }
    }, duration);
    return () => clearTimeout(t);
  }, [show, duration, onDismiss]);

  const dismiss = () => {
    if (done.current) return;
    done.current = true;
    haptic('tap');
    onDismiss();
  };

  // Portal to <body> so the overlay escapes the animating scene's stacking
  // context and truly covers everything (progress bar, sticky CTA included).
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          key="mascot-interstitial"
          role="button"
          aria-label="Continue"
          onClick={dismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-center"
          style={{
            // Fully opaque at the edges so the progress bar / CTA never peek through.
            background:
              'radial-gradient(125% 95% at 50% 38%, rgba(52,27,84,0.99), #0e0820 78%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <Particles count={16} variant="mixed" />

          <motion.div
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="relative flex flex-col items-center gap-4"
          >
            <Mascot name={mascot} mood={mood} size={150} />
            <SpeechBubble tail="top" className="max-w-[20rem] !text-lg leading-snug">
              {message}
            </SpeechBubble>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-16 text-xs font-medium tracking-wide text-muted"
          >
            tap to continue
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Guides the user to scroll when a scene overflows the viewport. Robust against
 * late-loading comic images (re-checks on resize/load + a short poll), and sits
 * above the sticky CTA so it never overlaps it. Purely decorative (aria-hidden).
 */
export function ScrollHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = document.scrollingElement || document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight > 24;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setShow(scrollable && !nearBottom);
    };

    // Re-check as images/fonts load and the layout settles.
    const raf = requestAnimationFrame(check);
    const timers = [150, 500, 1000, 1800, 2800].map((t) => window.setTimeout(check, t));
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t));
      ro.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      window.removeEventListener('load', check);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-none fixed inset-x-0 z-[45] flex justify-center"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 104px)' }}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 rounded-full border-[3px] border-black bg-[var(--color-comic-yellow)] px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0px_#000]"
          >
            Scroll <span className="text-lg leading-none">↓</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      // Check if document is scrollable and we haven't scrolled to the bottom
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
      
      setShow(isScrollable && !isAtBottom);
    };

    // Check on mount and after a short delay for image loading
    checkScroll();
    const timeout = setTimeout(checkScroll, 500);

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-[110px] left-1/2 z-50 -translate-x-1/2 pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center anim-float gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Scroll</span>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

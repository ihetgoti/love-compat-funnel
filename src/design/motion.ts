import type { Variants, Transition } from 'framer-motion';

export const ROMANCE_EASE = [0.22, 1, 0.36, 1] as const;

export const sceneTransition: Transition = { duration: 0.5, ease: ROMANCE_EASE };

/** Cinematic scene enter/exit used by the AnimatePresence in FunnelController. */
export const sceneVariants: Variants = {
  initial: { opacity: 0, y: 26, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: sceneTransition },
  exit: { opacity: 0, y: -20, scale: 0.985, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

export const riseItem: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ROMANCE_EASE } },
};

export const popItem: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 26 } },
};

export const bubblePop: Variants = {
  initial: { opacity: 0, scale: 0.6, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 24 } },
  exit: { opacity: 0, scale: 0.7, y: 6, transition: { duration: 0.2 } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

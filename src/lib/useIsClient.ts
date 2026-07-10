import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and hydration, then true after mount — without a
 * setState-in-effect. Use to gate purely decorative, non-deterministic markup
 * (randomized particle styles, rgba filters the browser re-serializes) so the
 * server and client trees always match.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

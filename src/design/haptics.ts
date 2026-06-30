/**
 * Haptic feedback via the Vibration API (Android/Chrome; iOS Safari ignores it
 * gracefully). Every call is a safe no-op where unsupported.
 */
export type HapticPattern = 'tap' | 'select' | 'success' | 'reveal' | 'soft' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  soft: 6,
  tap: 10,
  select: 16,
  success: [12, 40, 22],
  reveal: [10, 26, 10, 26, 30],
  error: [40, 30, 40],
};

export function haptic(pattern: HapticPattern = 'tap'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* unsupported — ignore */
  }
}

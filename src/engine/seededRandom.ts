/**
 * Deterministic pseudo-randomness.
 *
 * The whole engine is seeded by a stable hash of the couple so the same two
 * people always receive the same "magical" result — shareable and re-openable —
 * while still feeling bespoke. No Math.random anywhere in the engine.
 */

export type RNG = () => number;

/** FNV-1a-style 32-bit hash over the joined parts. */
export function hashSeed(...parts: Array<string | number>): number {
  let h = 2166136261 >>> 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — fast, good distribution, fully deterministic. */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: RNG, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Pick `n` unique items (Fisher–Yates partial). */
export function sample<T>(rng: RNG, arr: readonly T[], n: number): T[] {
  const copy = arr.slice();
  const count = Math.min(n, copy.length);
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    out.push(copy[i]);
  }
  return out;
}

export function shuffle<T>(rng: RNG, arr: readonly T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Deterministic, stateless 0..1 derived from arbitrary parts. */
export function unitFrom(...parts: Array<string | number>): number {
  return mulberry32(hashSeed(...parts))();
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

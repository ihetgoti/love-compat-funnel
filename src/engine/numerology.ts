/** Deterministic numerology — Life Path + Expression numbers and their harmony. */

const MASTERS = new Set([11, 22, 33]);

function sumDigits(s: string): number {
  let total = 0;
  for (const ch of s) {
    const d = ch.charCodeAt(0) - 48;
    if (d >= 0 && d <= 9) total += d;
  }
  return total;
}

/** Life Path from an ISO yyyy-mm-dd date. Master numbers 11/22/33 are preserved. */
export function lifePathFromDob(dob: string | null): number {
  if (!dob) return 7;
  let n = sumDigits(dob);
  while (n > 9 && !MASTERS.has(n)) {
    n = sumDigits(String(n));
  }
  return n;
}

export function isMasterNumber(n: number): boolean {
  return MASTERS.has(n);
}

/** Reduce a master to its root for matrix lookups (11→2, 22→4, 33→6). */
function root(n: number): number {
  if (n === 11) return 2;
  if (n === 22) return 4;
  if (n === 33) return 6;
  return n;
}

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9,
};

/** Expression number from a name (flavor). 0 if name is empty. */
export function expressionNumber(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters) return 0;
  let n = 0;
  for (const ch of letters) n += PYTHAGOREAN[ch] ?? 0;
  while (n > 9 && !MASTERS.has(n)) n = sumDigits(String(n));
  return n;
}

/** Life-path compatibility 0..1. Warm baseline, bonus for classic harmonies. */
export function lifePathCompat(a: number, b: number): number {
  const ra = root(a);
  const rb = root(b);
  if (ra === rb) return 0.85; // kindred path
  const pair = [ra, rb].sort((x, y) => x - y).join('-');
  const harmonious: Record<string, number> = {
    '1-3': 0.84, '1-5': 0.86, '1-7': 0.78, '2-4': 0.82, '2-6': 0.88,
    '2-8': 0.8, '3-5': 0.84, '3-6': 0.82, '3-9': 0.86, '4-8': 0.85,
    '5-7': 0.8, '6-9': 0.87, '4-6': 0.78, '1-9': 0.76, '5-9': 0.78,
  };
  return harmonious[pair] ?? 0.66;
}

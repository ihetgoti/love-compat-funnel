/** Money like $19 or $2.99. */
export function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** First name (or a fallback) from a full name string. */
export function firstName(name: string | undefined | null, fallback = ''): string {
  return (name ?? '').trim().split(/\s+/)[0] || fallback;
}

/** Pretty ISO date → "May 10, 1996". */
export function prettyDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map((p) => parseInt(p, 10));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!y || !m || !d) return '';
  return `${months[m - 1]} ${d}, ${y}`;
}

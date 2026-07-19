import { redirect } from 'next/navigation';
import { FunnelController } from '@/funnel/FunnelController';
import { COUNTRY_CODES, type CountryCode } from '@/content/pricing';

/**
 * Market-locked campaign URLs — one per pricing market:
 *
 *   /in → ₹99 / ₹990      /us → $4.99 / $49.90    /gb → £3.99 / £39.90
 *   /au → A$6.99 / A$69.90  /nz → NZ$7.99 / NZ$79.90
 *   /th → ฿149 / ฿1,490     /vn → ₫99,000 / ₫990,000
 *
 * Point each country's ad set at its URL and every visitor sees that market's
 * pricing regardless of device settings (URL wins over auto-detect and any
 * previously saved choice). Unknown codes fall back to the auto-detecting root.
 */
export function generateStaticParams() {
  return COUNTRY_CODES.map((c) => ({ market: c.toLowerCase() }));
}

export default async function MarketPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const code = market.toUpperCase();
  if (!(COUNTRY_CODES as string[]).includes(code)) redirect('/');
  return <FunnelController forcedMarket={code as CountryCode} />;
}

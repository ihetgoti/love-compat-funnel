import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AnalyticsScripts } from '@/analytics/AnalyticsScripts';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softncute.com'),
  title: 'softncute — Are You Two Meant To Be? 💞',
  description:
    'Discover your true love compatibility in 60 magical seconds. A personal, cinematic reading made just for you and them — only on softncute.com.',
  applicationName: 'softncute',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'softncute' },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    siteName: 'softncute',
    url: 'https://softncute.com',
    title: 'softncute — Are You Two Meant To Be? 💞',
    description: 'Discover your true love compatibility in 60 magical seconds.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#160d28',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}

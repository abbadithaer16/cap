import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { BrandDefs } from '@/components/GearRing';
import { INSTALL_CAPTURE_SCRIPT } from '@/components/pwa/install-store';
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';
import { absoluteUrl, dict, lang, site, siteUrl, t } from '@/lib/site';
import { cairo } from './fonts';
import './globals.css';

const title = t(site.seo.title);
const description = t(site.seo.description);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { absolute: title },
  description,
  applicationName: t(site.name),
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    siteName: t(site.name),
    title,
    description,
    locale: lang === 'ar' ? 'ar_JO' : 'en_US',
    images: [{ url: site.images.og, width: 1200, height: 630, alt: t(site.name) }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [site.images.og] },
  icons: {
    icon: [
      { url: site.images.icons.icon192, type: 'image/png', sizes: '192x192' },
      { url: site.images.icons.icon512, type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: site.images.icons.apple, sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  // Installed app on iPhone: full screen, black status bar, "الرعد" under the icon.
  appleWebApp: { capable: true, title: t(site.shortName), statusBarStyle: 'black' },
  other: { 'apple-mobile-web-app-capable': 'yes' },
  formatDetection: { telephone: false },
  // Demo before client approval: <meta name="robots" content="noindex">. Set noindex: false in site.config.ts to go live.
  ...(site.noindex ? { robots: 'noindex' } : {}),
};

export const viewport: Viewport = {
  themeColor: site.colors.background,
  colorScheme: 'dark',
};

const c = site.colors;
const colorVars = {
  '--c-background': c.background,
  '--c-surface': c.surface,
  '--c-border': c.border,
  '--c-text': c.text,
  '--c-text-soft': c.textSoft,
  '--c-text-muted': c.textMuted,
  '--c-glow': c.glow,
  '--c-button': c.button,
  '--c-link': c.link,
  '--c-fire-start': c.fire[0],
  '--c-fire-end': c.fire[1],
  '--c-star': c.star,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={colorVars}
      className={cairo.variable}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-btn focus:px-5 focus:py-3 focus:font-bold focus:text-white"
        >
          {dict.skip}
        </a>
        <script dangerouslySetInnerHTML={{ __html: INSTALL_CAPTURE_SCRIPT }} />
        <BrandDefs glow={c.glow} fire={c.fire} />
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

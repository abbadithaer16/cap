import type { MetadataRoute } from 'next';
import { site, t } from '@/lib/site';

export const dynamic = 'force-static';

/** /manifest.webmanifest: lets phones install the site as an app. */
export default function manifest(): MetadataRoute.Manifest {
  const navy = site.colors.background;
  const icons = site.images.icons;
  return {
    id: '/',
    name: t(site.name),
    short_name: t(site.shortName),
    description: t(site.seo.description),
    lang: site.lang,
    dir: site.lang === 'ar' ? 'rtl' : 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: navy,
    theme_color: navy,
    icons: [
      { src: icons.icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icons.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icons.maskable512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

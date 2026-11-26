import { existsSync } from 'node:fs';
import path from 'node:path';
import config from '@site';
import { getDictionary } from './dictionary';
import { waHref } from './phone';
import type { GalleryPhoto, Lang, SiteConfig, Text, Weekday } from './types';

export const site: SiteConfig = config;
export const lang: Lang = site.lang;
export const dict = getDictionary(lang);

/** Text in the site's language (falls back to Arabic). */
export function t(text: Text): string {
  // Keep short titles on the same line as the name: "م. رعد", "د. أحمد", "Eng. Sam"
  return (text[lang] ?? text.ar).replace(/(^|\s)(م|د|أ|Eng|Dr)\.\s/g, '$1$2.\u00a0');
}

/* ── Phone numbers & links ─────────────────────────────────────────────── */

export { internationalDigits, telHref, waHref } from './phone';

/** Every WhatsApp message sent from the site starts with "حجز من الموقع ✅". */
export function withPrefix(message: string): string {
  return `${dict.waPrefix}\n${message}`;
}

export function bookingWhatsApp(message: string = dict.generalMessage): string {
  return waHref(site.contact.whatsapp, withPrefix(message));
}

export const mainPhone = site.contact.phones[0];

/* ── URLs ─────────────────────────────────────────────────────────────────── */

/**
 * Public address of the site, used in search results, sitemap and WhatsApp/Facebook previews.
 * Order: site.config.ts `siteUrl` → NEXT_PUBLIC_SITE_URL → Netlify (URL) → Vercel → localhost.
 */
export function siteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL || // set by Netlify on every build: the site's main address
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    '';
  return (site.siteUrl || fromEnv || 'http://localhost:3000').replace(/\/$/, '');
}

if (process.env.NODE_ENV === 'production' && siteUrl().startsWith('http://localhost')) {
  console.warn(
    '\n⚠ siteUrl is not set: links in Google and WhatsApp previews will point to localhost.\n' +
      "  Set siteUrl in site.config.ts (e.g. 'https://alraad-autojo.netlify.app'), or build on Netlify/Vercel.\n",
  );
}

export function absoluteUrl(p: string): string {
  return `${siteUrl()}${p}`;
}

/* ── Opening hours ────────────────────────────────────────────────────────── */

const week: Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

function orderedWeek(): Weekday[] {
  const i = week.indexOf(site.weekStartsOn);
  return [...week.slice(i), ...week.slice(0, i)];
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, 0, 1, h, m)));
}

export type HoursRow = { days: string; hours: string; closed: boolean };

/** Groups consecutive days with the same hours: "السبت – الخميس · 9:00 ص – 7:00 م". */
export function hoursRows(): HoursRow[] {
  const rows: { from: Weekday; to: Weekday; key: string }[] = [];
  for (const day of orderedWeek()) {
    const h = site.hours[day];
    const key = h ? h.join('-') : 'closed';
    const last = rows.at(-1);
    if (last && last.key === key) last.to = day;
    else rows.push({ from: day, to: day, key });
  }
  return rows.map(({ from, to, key }) => {
    const h = site.hours[from];
    return {
      days: from === to ? dict.weekdays[from] : `${dict.weekdays[from]} – ${dict.weekdays[to]}`,
      hours: h ? `${formatTime(h[0])} – ${formatTime(h[1])}` : dict.location.closed,
      closed: key === 'closed',
    };
  });
}

const schemaDay: Record<Weekday, string> = {
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
};

export function openingHoursSpecification() {
  return orderedWeek()
    .filter((d) => site.hours[d])
    .map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: schemaDay[d],
      opens: site.hours[d]![0],
      closes: site.hours[d]![1],
    }));
}

/* ── Gallery ──────────────────────────────────────────────────────────────── */

const publicFile = (src: string) => path.join(process.cwd(), 'public', src);

export function galleryPhotos(): GalleryPhoto[] {
  return site.images.gallery;
}

/* ── Config checks (stop the build with a clear message) ─────────────────── */

function validate(c: SiteConfig) {
  const problems: string[] = [];
  const phone = /^0\d{8,9}$|^\+?962\d{8,9}$/;
  if (!c.contact.phones.length) problems.push('contact.phones needs at least one number.');
  c.contact.phones.forEach((p, i) => {
    if (!phone.test(p)) problems.push(`contact.phones[${i}] "${p}" should look like 0796999112.`);
  });
  if (!/^962\d{8,9}$/.test(c.contact.whatsapp)) {
    problems.push(`contact.whatsapp "${c.contact.whatsapp}" should be digits only, like 962796999112.`);
  }
  for (const [key, value] of Object.entries(c.colors)) {
    const list = Array.isArray(value) ? value : [value];
    if (!list.every((v) => /^#[0-9a-f]{6}$/i.test(v))) problems.push(`colors.${key} must be a 6-digit hex colour like #3B82F6.`);
  }
  c.services.forEach((s, i) => {
    if (s.highlight && !s.title.ar.endsWith(s.highlight.ar)) {
      problems.push(`services[${i}].highlight "${s.highlight.ar}" must be the last words of its title "${s.title.ar}".`);
    }
    if (s.chips && s.chips.length > 3) problems.push(`services[${i}] has more than 3 chips.`);
  });
  const icons = Object.values(c.images.icons);
  for (const f of [c.images.logo.src, c.images.og, ...icons, ...c.images.gallery.map((g) => g.src)]) {
    if (!existsSync(publicFile(f))) problems.push(`Image not found: public${f}`);
  }
  c.images.gallery.forEach((g, i) => {
    if (!/[\u0600-\u06FF]/.test(g.alt.ar)) problems.push(`images.gallery[${i}].alt needs an Arabic description of the photo.`);
  });
  if (problems.length) {
    throw new Error(`\n\nsite.config.ts has ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}\n`);
  }
}

validate(site);

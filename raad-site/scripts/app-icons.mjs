/**
 * App icons (browser tab, Android home screen, iPhone home screen) from the round logo badge,
 * centred with padding on the site's navy. Run after changing the badge:
 *
 *   npm run app-icons
 *
 * - icon-192.png, icon-512.png: the badge with a small margin.
 * - icon-maskable-512.png: smaller badge, inside the 80% safe circle Android may crop to.
 * - apple-touch-icon.png (180): iPhone rounds the corners itself.
 */
import path from 'node:path';
import sharp from 'sharp';

const badge = 'design-reference/logo-badge.png';
const outDir = 'public/images/raad';
const NAVY = '#070B1F'; // colors.background in site.config.ts

const icons = [
  { file: 'icon-192.png', size: 192, badge: 0.86 },
  { file: 'icon-512.png', size: 512, badge: 0.86 },
  { file: 'icon-maskable-512.png', size: 512, badge: 0.72 },
  { file: 'apple-touch-icon.png', size: 180, badge: 0.84 },
];

for (const icon of icons) {
  const d = Math.round(icon.size * icon.badge);
  const round = await sharp(badge).resize(d, d, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const offset = Math.round((icon.size - d) / 2);
  await sharp({ create: { width: icon.size, height: icon.size, channels: 4, background: NAVY } })
    .composite([{ input: round, top: offset, left: offset }])
    .flatten({ background: NAVY })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(outDir, icon.file));
}

console.log(`Wrote ${icons.map((i) => i.file).join(', ')} to ${outDir}`);

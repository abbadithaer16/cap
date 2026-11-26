/**
 * Creates WebP copies of every photo in public/images at the widths next/image asks for.
 * Runs automatically before `npm run dev` and `npm run build`; you never need to run it by hand.
 * Output goes to public/images/_generated (not committed: it is rebuilt every time).
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { deviceSizes, imageSizes } from '../image-widths.mjs';

const root = path.resolve('public/images');
const outRoot = path.join(root, '_generated');
const widths = [...new Set([...imageSizes, ...deviceSizes])].sort((a, b) => a - b);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== outRoot) yield* walk(full);
    } else if (/\.(jpe?g|png|webp)$/i.test(entry.name) && !/^(og|icon|apple-touch-icon)\./i.test(entry.name)) {
      // og / icon files are served as-is (social previews and browser icons)
      yield full;
    }
  }
}

let made = 0;
for await (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\.[a-z0-9]+$/i, '');
  const srcTime = (await stat(file)).mtimeMs;
  for (const w of widths) {
    const out = path.join(outRoot, `${rel}-${w}.webp`);
    const existing = await stat(out).catch(() => null);
    if (existing && existing.mtimeMs >= srcTime) continue; // up to date
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 66 }).toFile(out);
    made++;
  }
}
console.log(`images: ${made ? `${made} file(s) generated` : 'up to date'} in public/images/_generated`);

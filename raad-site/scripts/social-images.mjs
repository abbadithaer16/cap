/**
 * Creates the social preview image (og.jpg, 1200×630): navy background, the glowing gear ring
 * on the left, the AL-RAAD logo on the right. Run after changing the logo or the colours:
 *
 *   npm run social-images
 *
 * App icons are made by scripts/app-icons.mjs (npm run app-icons).
 */
import path from 'node:path';
import sharp from 'sharp';

const logo = 'public/images/raad/logo-crop.jpg';
const outDir = 'public/images/raad';

const NAVY = '#0A1230';
const DEEP = '#070B1F';
const GLOW = '#3B82F6';
const FIRE = ['#FFB020', '#FF3B30'];

/** Same drawing as src/components/GearRing.tsx (200 × 200 box), with its own defs. */
function gear({ x = 0, y = 0, size = 200 }) {
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((d) => `<rect x="93" y="15" width="14" height="14" rx="3" fill="#6FA6FC" transform="rotate(${d} 100 100)"/>`)
    .join('');
  return `
  <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="-20 -20 240 240" overflow="visible">
    <defs>
      <linearGradient id="ring" gradientUnits="userSpaceOnUse" x1="40" y1="18" x2="160" y2="182">
        <stop offset="0" stop-color="#8EC0FF"/><stop offset="0.45" stop-color="${GLOW}"/><stop offset="1" stop-color="#2F6BE0"/>
      </linearGradient>
      <linearGradient id="bolt" gradientUnits="userSpaceOnUse" x1="128" y1="38" x2="80" y2="164">
        <stop offset="0" stop-color="${FIRE[0]}"/><stop offset="0.75" stop-color="${FIRE[1]}"/>
      </linearGradient>
      <radialGradient id="core" cx="50%" cy="38%" r="62%">
        <stop offset="0" stop-color="#14214F"/><stop offset="1" stop-color="#060A1C"/>
      </radialGradient>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="near"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="far"/>
        <feMerge><feMergeNode in="far"/><feMergeNode in="near"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="fire" x="-60%" y="-40%" width="220%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="far"/>
        <feMerge><feMergeNode in="far"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="100" cy="100" r="94" fill="none" stroke="${GLOW}" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="0.01 5.4" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="70" fill="url(#core)"/>
    <circle cx="100" cy="100" r="69" fill="none" stroke="${GLOW}" stroke-opacity="0.45" stroke-width="1.2"/>
    <g filter="url(#glow)">
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#ring)" stroke-width="6.5"/>
      ${teeth}
    </g>
    <path d="M113 38 L139 38 L116 87 L137 87 L82 164 L95 110 L69 110 Z" fill="url(#bolt)" stroke="#FFD58A" stroke-opacity="0.85" stroke-width="2" stroke-linejoin="round" filter="url(#fire)"/>
  </svg>`;
}

function background(w, h, lightX) {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="light" cx="${lightX}" cy="0.5" r="0.55">
      <stop offset="0" stop-color="${GLOW}" stop-opacity="0.16"/><stop offset="1" stop-color="${GLOW}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#light)"/>`;
}

// Social image: gear ring on the left, the logo on the right (Arabic layout reads right first).
const W = 1200;
const H = 630;
const LOGO_W = 600;
const LOGO_H = Math.round((LOGO_W * 354) / 603);
const streaks = `
  <line x1="40" y1="150" x2="760" y2="20" stroke="${GLOW}" stroke-opacity="0.35" stroke-width="1.5"/>
  <line x1="520" y1="640" x2="1200" y2="520" stroke="${FIRE[1]}" stroke-opacity="0.35" stroke-width="1.5"/>`;
const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${background(W, H, 0.22)}
  ${streaks}
  ${gear({ x: 70, y: 95, size: 440 })}
</svg>`;
const roundMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_W}" height="${LOGO_H}"><rect width="${LOGO_W}" height="${LOGO_H}" rx="28" fill="#fff"/></svg>`,
);
const logoImg = await sharp(logo)
  .resize(LOGO_W, LOGO_H, { fit: 'cover' })
  .composite([{ input: roundMask, blend: 'dest-in' }])
  .png()
  .toBuffer();
await sharp(Buffer.from(base))
  .composite([{ input: logoImg, top: Math.round((H - LOGO_H) / 2), left: W - LOGO_W - 60 }])
  .flatten({ background: DEEP })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(outDir, 'og.jpg'));

console.log(`Wrote og.jpg to ${outDir}`);

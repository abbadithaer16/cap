import type { ReactNode } from 'react';
import { cn } from '@/lib/phone';

/*
 * The glowing blue gear ring from AL-RAAD's own designs (banner and service cards):
 * dotted outer circle, a bright ring with 8 square teeth, a thin inner ring and a dark core.
 * It is the only thing on the site that glows. Drawn in a 200 × 200 box.
 */

const C = 100;
const RING = 78;
const TOOTH = 14;
const TEETH = [0, 45, 90, 135, 180, 225, 270, 315];

/** The hero bolt (filled), centred in the 200 × 200 box. */
const BOLT = 'M113 38 L139 38 L116 87 L137 87 L82 164 L95 110 L69 110 Z';

/**
 * Gradients and glow filters shared by every gear ring and every orange–red icon.
 * Rendered once in the layout (an SVG with no size, not display:none, so browsers keep the defs).
 */
export function BrandDefs({ glow, fire }: { glow: string; fire: [string, string] }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      <defs>
        {/* Line icons (24 × 24). userSpaceOnUse so straight lines get the gradient too. */}
        <linearGradient id="raad-fire" gradientUnits="userSpaceOnUse" x1="17" y1="2" x2="7" y2="22">
          <stop offset="0" stopColor={fire[0]} />
          <stop offset="1" stopColor={fire[1]} />
        </linearGradient>
        {/* Hero bolt (200 × 200) */}
        <linearGradient id="raad-fire-bolt" gradientUnits="userSpaceOnUse" x1="128" y1="38" x2="80" y2="164">
          <stop offset="0" stopColor={fire[0]} />
          <stop offset="0.4" stopColor={mix(fire[0], fire[1])} />
          <stop offset="0.75" stopColor={fire[1]} />
        </linearGradient>
        <linearGradient id="raad-ring" gradientUnits="userSpaceOnUse" x1="40" y1="18" x2="160" y2="182">
          <stop offset="0" stopColor="#8EC0FF" />
          <stop offset="0.45" stopColor={glow} />
          <stop offset="1" stopColor="#2F6BE0" />
        </linearGradient>
        <radialGradient id="raad-core" cx="50%" cy="38%" r="62%">
          <stop offset="0" stopColor="#14214F" />
          <stop offset="1" stopColor="#060A1C" />
        </radialGradient>
        <filter id="raad-glow" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="near" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="far" />
          <feMerge>
            <feMergeNode in="far" />
            <feMergeNode in="near" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="raad-fire-glow" x="-60%" y="-40%" width="220%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="far" />
          <feComponentTransfer in="far" result="soft">
            <feFuncA type="linear" slope="0.7" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/** Average of two #rrggbb colours (middle stop of the bolt gradient). */
function mix(a: string, b: string): string {
  const n = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round((n(a, i) + n(b, i)) / 2).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The gear ring. Width comes from `className`; it is always square.
 * `bolt` draws the hero lightning bolt inside; otherwise `children` (an icon) is centred.
 */
export function GearRing({ className, children, bolt = false }: { className?: string; children?: ReactNode; bolt?: boolean }) {
  return (
    <div className={cn('relative grid aspect-square shrink-0 place-items-center', className)}>
      <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full overflow-visible" focusable="false">
        <circle cx={C} cy={C} r={94} fill="none" className="stroke-glow" strokeOpacity={0.5} strokeWidth={1.6} strokeDasharray="0.01 5.4" strokeLinecap="round" />
        <circle cx={C} cy={C} r={70} fill="url(#raad-core)" />
        <circle cx={C} cy={C} r={69} fill="none" className="stroke-glow" strokeOpacity={0.45} strokeWidth={1.2} />
        <g filter="url(#raad-glow)">
          <circle cx={C} cy={C} r={RING} fill="none" stroke="url(#raad-ring)" strokeWidth={6.5} />
          {TEETH.map((deg) => (
            <rect
              key={deg}
              x={C - TOOTH / 2}
              y={C - RING - TOOTH / 2}
              width={TOOTH}
              height={TOOTH}
              rx={3}
              className="fill-[color-mix(in_srgb,var(--color-glow)_78%,white)]"
              transform={`rotate(${deg} ${C} ${C})`}
            />
          ))}
        </g>
        {bolt ? (
          <path
            d={BOLT}
            fill="url(#raad-fire-bolt)"
            stroke="#FFD58A"
            strokeOpacity={0.85}
            strokeWidth={2}
            strokeLinejoin="round"
            filter="url(#raad-fire-glow)"
          />
        ) : null}
      </svg>
      {children ? <div className="relative grid w-[40%] place-items-center [filter:drop-shadow(0_0_7px_rgb(255_128_48/0.55))]">{children}</div> : null}
    </div>
  );
}

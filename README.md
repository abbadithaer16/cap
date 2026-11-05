# McDonald's Jordan, a 3D concept

An unofficial, scroll-driven WebGL concept for McDonald's Jordan, in English and Arabic.
It is not affiliated with McDonald's. Menus, deals and locations live on the
[official site](https://www.mcdonalds.com.jo/).

The art direction follows a set of print references: one flat brand colour per frame,
one hero product in studio light, surreal scale, minimal type and film grain. Each scroll
section is one of those posters:

| Scene | Field | What happens |
|---|---|---|
| Every road leads here | Ketchup red | The arches stand as architecture, each leg running out as a lane. On scroll the M splits down its middle stem and swings open like doors onto a Big Mac. |
| Take a Big Mac apart | Oxblood | The burger lifts off the street and separates into its layers, with labels that track each layer. |
| Golden. Salted. Gone. | Arch gold | A fries carton rises in front of a giant crop of the arches; fries drop in. |
| Float like it's the Dead Sea | Mustard | Overhead: a McCafé cup on its side, the spill spreading into a pool with rings floating on it. |
| See you under the arches | Roast | The burger lands on a pedestal under a single spotlight. |

The earlier NEXORA headphone page is kept at `/nexora.html`.

## Run

```bash
npm ci
npm run dev      # http://localhost:5173/cap/
npm run build    # outputs both pages to dist/
```

Add `?lang=ar` to open the Arabic version; the toggle in the header switches at any time.

## How it works

- **One number drives everything.** Native scroll is mapped to `p` (0–5), one unit per
  scene (`src/lib/timeline.js`). Each scene holds for 62% of its unit, then hands over to
  the next. Camera poses, object states, the colour field and the labels are pure functions
  of `p`, so fast, reversed or jumped scrolling lands on the same frame. `p` is damped
  once in `src/lib/store.js`; nothing per-frame goes through React state.
- **Colour is CSS, product is WebGL.** The canvas is transparent and sits over a fixed
  colour field (`src/components/Field.jsx`), so brand colours stay exact. The canvas adds
  product, light and shadow (via a `ShadowMaterial` floor).
- **Everything is procedural.** The arches are extruded from one bezier outline
  (`src/lib/arches.js`) that also draws the SVG mark and the print on the carton and cup.
  The burger, carton, cup, spill and beans are lathes, extrusions and instanced meshes;
  textures are painted on 2D canvases at runtime (`src/three/textures.js`). There are no
  model or image downloads.
- **Framing.** The camera uses a lens shift (`setViewOffset`) to place the product beside
  the text without turning away from it. On narrow screens it widens and steps back. In
  Arabic the shift mirrors with the layout.
- **DOM tracked from 3D.** Exploded-view labels and the curved McCafé line are HTML/SVG
  positioned each frame by projecting 3D anchor points (`src/components/Overlay.jsx`).

## Accessibility and fallbacks

- All words are real text in the sections. The canvas and overlay are `aria-hidden`.
- `prefers-reduced-motion`: scenes cut to their most legible frame instead of flying, with
  no idle rotation, ripples, grain shimmer or headline animation.
- Without WebGL, the sections still read as colour posters with the arches mark in the hero.
- Arabic uses Cairo and a mirrored layout via logical CSS properties; English uses Archivo.

## Performance notes

Adaptive DPR (max 2 desktop, 1.5 mobile) through drei's `PerformanceMonitor`; scenes
outside their window are hidden; shaders are compiled up front; one directional and one
spot shadow map. Frame rates have not been measured on real devices yet. The headless
browser used for screenshots renders WebGL in software, so its frame rate is not evidence
either way.

# McDonald's Jordan, a design concept

An unofficial, scroll-driven concept for McDonald's Jordan, in English and Arabic.
It is not affiliated with McDonald's. Menus, deals and locations live on the
[official site](https://www.mcdonalds.com.jo/).

The art direction follows a set of print references: one flat brand colour per frame,
one real product photo, minimal type and film grain. Each scroll section is one poster:

| Scene | Field | What happens |
|---|---|---|
| Every road leads here | Ketchup red | The arches stand at the end of three yellow lanes with a Big Mac behind them. On scroll the M splits down its middle stem, the halves slide apart and the burger comes forward. |
| Take a Big Mac apart | Oxblood | The Big Mac, large, with labels pointing at each ingredient. |
| Golden. Salted. Gone. | Arch gold | The fries rise in front of a giant crop of the arches. |
| Float like it's the Dead Sea | Mustard | The McCafé cup floats as you scroll, with a curved line of type over it. |
| See you under the arches | Roast | The Big Mac under a single spotlight, with a link to the official site. |

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
  the next. Every photo's position, size and rotation is a pure function of `p` and the
  viewport (`src/lib/choreo.js`), so fast, reversed or jumped scrolling lands on the same
  frame. `p` is damped once in `src/lib/store.js`; nothing per-frame goes through React state.
- **Colour is a wipe, not a fade.** The fixed colour field (`src/components/Field.jsx`)
  reveals each scene's colour at its section's real top edge, so colour and text arrive
  together.
- **Photos are transformed, never re-laid-out.** The stage (`src/components/Stage.jsx`)
  moves each cut-out with `transform` only. Labels and the curved McCafé line are placed
  from the same pose, so they stay attached to the product.
- **The arches are vector.** One bezier outline (`src/lib/arches.js`) draws the logo mark,
  the two sliding halves in the opening scene and their floor shadows.

## Product photos

`src/assets/products/` holds transparent WebP cut-outs (Big Mac, fries, McCafé cup)
made from photos supplied by the site owner. The backgrounds were removed with a
small numpy/scipy script, so no image service was involved. These are McDonald's
product photos, so check you have the right to publish them before deploying. To use
sharper originals, replace the files with the same names and update their sizes in
`src/lib/choreo.js` (`RATIO`) and `src/components/Stage.jsx` (`BASE`).

## Accessibility

- All words are real text in the sections; the photo stage is `aria-hidden`.
- `prefers-reduced-motion`: scenes cut to their most legible frame instead of moving,
  with no grain shimmer or headline animation.
- Arabic uses Cairo and a mirrored layout via logical CSS properties; English uses Archivo.

## Performance notes

The main page ships about 112 kB of gzipped JavaScript and about 207 kB of product photos,
with no WebGL. Frame rates have not been measured on real devices yet.

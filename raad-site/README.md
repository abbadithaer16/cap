# مركز الرعد لصيانة المركبات – AL-RAAD Vehicle Maintenance Center

One-page Arabic (RTL) website for AL-RAAD, Marka Al-Shamaliya, Amman. Built from the JHM
template (Next.js + TypeScript + Tailwind, exported as static files). No backend: bookings open
WhatsApp with a ready message.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # optimises photos, then writes the static site to ./out
```

Requires Node.js 20.9 or newer.

> **Demo mode:** `noindex: true` in `site.config.ts` adds `<meta name="robots" content="noindex">`
> so Google does not list the site before the client approves it. Set it to `false` to go live.

---

## Edit the content: `site.config.ts`

Everything the site says lives in [`site.config.ts`](site.config.ts): name, headline, car types,
trust line, engineer, Google rating, services (title, highlighted words, tags), reviews, opening
hours, phones, WhatsApp, address, map and colours.

- **Phones:** write them as printed (`'0796999112'`). The first one is used for every "Call"
  button. `contact.whatsapp` (`'962796999112'`) receives every WhatsApp message.
- **WhatsApp messages:** every message sent from the site starts with `حجز من الموقع ✅`
  (`waPrefix` in `src/lib/dictionary.ts`).
- **Services:** `highlight` is the end of the title shown on its own line in orange–red, like
  the center's own cards ("صيانة" / "البريكات"). `chips` are up to three tags under the title.
  The booking form's "الخدمة" list is built from the same titles (plus "أخرى").
- **Reviews:** real Google reviews, copied word for word. The third reviewer's name is still
  `[الاسم]`: replace it with the name shown on Google.
- **Map:** `contact.mapEmbedUrl` currently searches Google Maps for the center's name in Marka
  Al-Shamaliya. For the exact pin: Google Maps → the center → **Share → Embed a map** → copy only
  the link inside `src="..."` and paste it there. "الاتجاهات" already opens the exact place.
- **Hours:** 24-hour times per day; `null` means closed. Consecutive days with the same hours
  are grouped automatically ("السبت – الخميس").

Interface text (button labels, form errors, section titles) is in `src/lib/dictionary.ts`.

If something in the config is wrong (a malformed phone number, a missing image), `npm run dev`
and `npm run build` stop with a message saying exactly what to fix.

## Workshop photos (gallery)

`images.gallery` in `site.config.ts` lists the real workshop photos in
`public/images/raad/` (number plates blurred). The first one is shown large (the storefront);
the others fill the grid next to and under it. To add a photo: put the file in
`public/images/raad/`, add it to the list with what it shows in `alt`, and rebuild. Three
photos per extra row look best on desktop. Use `focus` (e.g. `'50% 30%'`) to choose which part
stays visible when a photo is cropped. A listed file that is missing shows a marked
placeholder instead, and the build prints its name.

Blur number plates (and any phone numbers on plate frames) before adding customers' cars.
Only real photos: the AI-generated posters stay out of the gallery.

You don't need to resize anything: every build creates small WebP versions of each photo
(`public/images/_generated`, not committed), and phones download the small ones.

## Logo, share image and icons

`public/images/raad/logo-crop.jpg` is the logo in the header and footer. After changing it (or
the colours), run:

```bash
npm run social-images
```

This rebuilds `og.jpg` (the preview shown when the link is shared on WhatsApp or Facebook) and
the browser and phone icons (the gear ring with the bolt). Commit the results.

## Design

Colours, glow and layout come from the center's own social media designs, kept in
[`design-reference/`](design-reference) (not part of the website):

- Deep navy background, white text, electric blue (`colors.glow`) and an orange → red gradient
  (`colors.fire`) for icons and highlighted words.
- Signature element: the glowing blue gear ring (`src/components/GearRing.tsx`), with the red
  lightning bolt in the hero and each service icon inside it. Nothing else glows.
- `banner.jpg` and `card-*.jpg` are style references only: all text on the site is real text.
- `poster-round.jpg` and `logo-badge.png` show AI-generated cars: never use them as workshop
  photos.

## Deploy

### Netlify Drop (current)

Run `npm run build` and drag the `out` folder (or a zip of its contents) onto
**Netlify → Deploys**. `siteUrl` in `site.config.ts` must be the Netlify address
(`https://raad-auto.netlify.app`) so Google and WhatsApp previews point to the right place.
A dropped site never updates on its own: rebuild and drop again after each change.

### Netlify from GitHub

**Site configuration → Build & deploy → Continuous deployment → Link repository** → this
repository, **Base directory** `raad-site`. Build command and publish folder come from
[`netlify.toml`](netlify.toml).

## Checked before delivery

- Screenshots at 375px and 1440px reviewed; no horizontal overflow; RTL throughout.
- Every WhatsApp link and the booking form message start with `حجز من الموقع ✅`.
- SEO: Arabic title/description, canonical, Open Graph image, `sitemap.xml`, `robots.txt`,
  and one JSON-LD `AutoRepair` entry for the single location. `noindex` while in demo.
- Accessibility: skip link, landmarks, labelled form fields with error messages, named links
  and buttons, 44px touch targets, visible focus, contrast ≥ 4.5:1 for text.
- Motion: only the hero text fades in once on load; turned off for visitors who prefer
  reduced motion.

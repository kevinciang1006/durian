# Durian Sriraja

Bilingual (Indonesian/English), SEO-first static marketing site for Durian
Sriraja, a family-run durian orchard in Bukit Lawang, North Sumatra. Built
with Astro 7 + Tailwind CSS v4. No backend — ordering happens via WhatsApp.

## Setup

```bash
npm install
npm run dev    # runs `ASTRO_DEV_BACKGROUND=false astro dev` so it stays in the foreground
```

Requires Node >= 22.12.

## Adding a durian variety

Create two Markdown files — no code changes needed:

- `src/content/varieties/id/<slug>.md`
- `src/content/varieties/en/<slug>.md`

Frontmatter shape (see any existing file for a full example):

```yaml
name: "Variety Name"
tagline: "Short one-line description"
flavorProfile: { sweetness: 1-5, bitterness: 1-5, creaminess: 1-5 }
season: "e.g. Mid-year & year-end"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "../../../assets/images/your-photo.jpg", alt: "Description" }]
featured: false
order: 6
```

The body text below the frontmatter is the variety's description paragraph.
The page at `/varietas/<slug>/` (and `/en/varieties/<slug>/`) is generated
automatically at build time.

## Managing photos

All real photography lives under `src/assets/images/` and is wired through
Astro's `<Image>` component (`astro:assets`), which converts every photo to
AVIF at build time, generates the right size for where it's used, and sets
explicit `width`/`height` so nothing shifts as the page loads. Images must
live under `src/` (not `public/`) for this pipeline to run — a file dropped
into `public/` is served as-is, unoptimized.

Current photos and where they're used:

- `musang-king.png`, `black-thorn.png`, `monthong.png`, `chanee.png` — one real photo per variety, referenced from that variety's Markdown frontmatter (`images[0].src`, path relative to the Markdown file: `../../../assets/images/<file>`).
- `placeholder-durian.jpg` — Sultan (D24) has no real photo yet; its frontmatter points here. Replace it the same way as any other variety once a photo exists.
- `hero.png` — Home page hero background (`HomeContent.astro`).
- `box-durian.png` — Home page international-callout image and the Export page's "Fresh & Frozen" / shipping block (`HomeContent.astro`, `ExportContent.astro`).
- `hands-durian.png` — Home page story-teaser image and Our Story's "Kebun yang Sedang Tumbuh / A Growing Orchard" block (`HomeContent.astro`, `OurStoryContent.astro`).
- `jungle-path.png` — Our Story's "Sebuah Undangan / An Invitation" block (`OurStoryContent.astro`).
- `tasting-durian.png` — Export page's "Visit the Farm" block (`ExportContent.astro`).
- `logo.png` — the circular brand mark in the header and footer (`Header.astro`, `Footer.astro`).

**To swap or add a photo:** drop the new file into `src/assets/images/`,
then either update the `import` statement in the component that uses it
(for hero/story/export photos) or the `images[0].src` path in the relevant
variety's Markdown frontmatter (for variety photos). No other code changes
are needed — Astro re-optimizes automatically on the next build.

**Source file sizes:** the photos supplied were 1.2–3.3MB PNGs (see table
below). That's fine — `<Image>` compresses them to AVIF at build time (the
site's built output is ~3MB total across all pages combined), but if you're
sourcing new photos, exporting them at roughly 1500–2000px on the long edge
before adding them keeps builds fast and avoids uploading multi-megabyte
files to the repo unnecessarily.

| File | Source size |
|---|---|
| jungle-path.png | 3.3MB |
| box-durian.png | 2.7MB |
| tasting-durian.png | 2.3MB |
| monthong.png | 2.3MB |
| chanee.png | 2.2MB |
| black-thorn.png | 2.2MB |
| musang-king.png | 2.2MB |
| hero.png | 2.0MB |
| hands-durian.png | 1.9MB |
| logo.png | 1.2MB |

## Setting the real WhatsApp number

Edit `WHATSAPP_NUMBER` in `src/config.ts`. Format: country code + number,
digits only, no `+`, spaces, or dashes (e.g. `6283194111119`).

## Setting the real domain

1. Update the `site` field in `astro.config.mjs`.
2. Update the `Sitemap:` line in `public/robots.txt` to match.

## Adding the farm's Instagram (or other social) link

Add a `sameAs` array to the `localBusinessJsonLd` object in
`src/components/BaseHead.astro`, e.g. `sameAs: ['https://instagram.com/...']`.

## Filling in the exact farm address

The Contact page (`src/components/ContactContent.astro`) and the
`LocalBusiness` JSON-LD (`src/components/BaseHead.astro`) currently use the
Bukit Lawang / Kabupaten Langkat region only, since the orchard itself is
off-grid and visits are by appointment. Update both files if a more precise
public address becomes available.

## Testing

```bash
npm run test    # vitest: i18n and WhatsApp-link unit tests
npm run sync    # validates all variety Markdown against the content schema
npm run check   # Astro's TypeScript checker
npm run build   # full static build to dist/
```

## Deploying to Cloudflare Pages

- Build command: `astro build`
- Output directory: `dist`
- Node version: 22
- No environment variables are required (the site has no backend).

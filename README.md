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
images: [{ src: "/images/placeholder-durian.jpg", alt: "Description" }]
featured: false
order: 6
```

The body text below the frontmatter is the variety's description paragraph.
The page at `/varietas/<slug>/` (and `/en/varieties/<slug>/`) is generated
automatically at build time.

## Swapping placeholder images

Images live in `public/images/` and are referenced by plain path (not
`astro:assets`), so swapping one in is just replacing the file at the same
path — no code changes:

- `public/images/placeholder-durian.jpg` — used by every variety card/detail page by default
- `public/images/placeholder-farm.jpg` — Home page hero background
- `public/images/placeholder-orchard.jpg` — Home page story-teaser image

To use a different photo per variety, change that variety's `images[0].src`
in its Markdown frontmatter to point at a new file under `public/images/`.

For better compression (AVIF/WebP), you can optionally move a real photo into
`src/assets/`, import it in the component that renders it, and swap the
plain `<img>` tag for Astro's `<Image>` from `astro:assets` — this is a
worthwhile upgrade once real photography replaces the placeholders, but
isn't required for the site to work.

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

# Durian Sriraja

Bilingual (Indonesian/English), SEO-first marketing site for Durian Sriraja,
a family-run durian orchard in Bukit Lawang, North Sumatra. Built with
Astro 7 + Tailwind CSS v4, deployed on Vercel. Every content page is static
(prerendered at build time); the one exception is `/api/contact`, a single
serverless function that sends email via Resend. Ordering still happens
primarily via WhatsApp — the contact form is an additional channel, not a
replacement.

## Setup

```bash
npm install
cp .env.example .env   # fill in real Resend values — see "Contact form" below
npm run dev             # runs `ASTRO_DEV_BACKGROUND=false astro dev` so it stays in the foreground
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

- `musang-king.png`, `black-thorn.png`, `monthong.png`, `sultan.png`, `chanee.png` — one real photo per variety (all 5 covered), referenced from that variety's Markdown frontmatter (`images[0].src`, path relative to the Markdown file: `../../../assets/images/<file>`).
- `placeholder-durian.jpg` — kept around as a generic fallback in case a future variety is added before its real photo is ready; no current variety uses it.
- `hero.png` — Home page hero background (`HomeContent.astro`).
- `box-durian.png` — Home page international-callout image and the Export page's "Fresh & Frozen" / shipping block (`HomeContent.astro`, `ExportContent.astro`).
- `young-orchard.png` — Our Story's "Kenapa Durian / Why Durian" block (the 2021 planting story) (`OurStoryContent.astro`).
- `hands-durian.png` — Home page story-teaser image and Our Story's "Kebun yang Sedang Tumbuh / A Growing Orchard" block (`HomeContent.astro`, `OurStoryContent.astro`).
- `jungle-path.png` — Our Story's "Sebuah Undangan / An Invitation" block (`OurStoryContent.astro`).
- `tasting-durian.png` — Export page's "Visit the Farm" block (`ExportContent.astro`).
- `seasonal-harvest.png` — Export page's "Seasonal Harvests" block (`ExportContent.astro`).
- `partnership.png` — Export page's "Long-Term Partnerships" block (`ExportContent.astro`).
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
| young-orchard.png | 2.9MB |
| jungle-path.png | 3.3MB |
| seasonal-harvest.png | 2.6MB |
| box-durian.png | 2.7MB |
| tasting-durian.png | 2.3MB |
| monthong.png | 2.3MB |
| sultan.png | 2.3MB |
| chanee.png | 2.2MB |
| black-thorn.png | 2.2MB |
| musang-king.png | 2.2MB |
| partnership.png | 2.1MB |
| hero.png | 2.0MB |
| hands-durian.png | 1.9MB |
| logo.png | 1.2MB |

## Contact form (Resend email)

The Contact page (`/kontak`, `/en/contact`) has a form in addition to the
WhatsApp button. On submit it POSTs to `src/pages/api/contact.ts`, the only
non-prerendered route in the project (`export const prerender = false`),
which deploys as a single Vercel Function — everything else stays static.

**How it works:**
1. Client-side (`src/components/ContactForm.astro`) does basic
   required-field validation, then `fetch('/api/contact', ...)`. States:
   idle → submitting (button disabled, label changes) → success (form
   replaced with a thank-you message) → error (inline message, field
   values untouched so nothing is lost). A hidden `website` field is a
   honeypot — real visitors never see or fill it.
2. Server-side (`src/pages/api/contact.ts`) re-validates everything with
   zod (the server is the source of truth, not the client check). A
   filled honeypot gets a silent `200 { ok: true }` with no email sent.
   A validation failure returns `400` with per-field error messages.
3. On success, two emails go out via Resend (`src/emails/notification.ts`,
   `src/emails/auto-reply.ts`): one to `CONTACT_TO_EMAIL` with the
   submission (reply-to set to the visitor's address, so replying goes
   straight to them), and one branded auto-reply to the visitor in their
   selected locale, with a WhatsApp link for a faster response.

**Required environment variables** (see `.env.example`):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | From https://resend.com/api-keys |
| `CONTACT_FROM_EMAIL` | Sending address — must be on a domain verified in Resend |
| `CONTACT_TO_EMAIL` | Inbox that receives new inquiries |

These are read server-side only (`import.meta.env` inside `api/contact.ts`
and the email templates) and never bundled into client-side code. `.env` is
gitignored; only `.env.example` (placeholder values) is committed.

**Testing the endpoint locally:**

```bash
npm run dev

# Valid submission (needs real env vars in .env to actually send email;
# without them you'll get a clean 500 instead of a crash)
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","company":"Acme Imports","phone":"+65 9123 4567","country":"Singapore","message":"Interested in a monthly order of Musang King.","locale":"en","website":""}'

# Honeypot check — should return {"ok":true} and send nothing
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@example.com","message":"spam","locale":"en","website":"http://spam.example"}'
```

**Before deploying to Vercel**, set these three environment variables in
the project's Vercel dashboard (Settings → Environment Variables) for the
Production (and Preview, if you want previews to send real email)
environment: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
The build will succeed without them, but every form submission will return
the 500 "server not configured" error until they're set.

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

## Deploying to Vercel

The site uses `@astrojs/vercel` as its adapter (required for the
`/api/contact` function), so it deploys to Vercel, not a generic static
host like Cloudflare Pages:

- Framework preset: Astro (auto-detected)
- Build command: `astro build` (default)
- Output directory: `.vercel/output` (handled automatically by the adapter — don't override it)
- Node version: 22
- Environment variables: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` (see "Contact form" above) — required for the form to send email, not required for the build to succeed.

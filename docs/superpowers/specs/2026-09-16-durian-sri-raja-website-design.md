# Durian Sri Raja Website — Design Spec

Date: 2026-09-16
Status: Approved by user, ready for implementation planning

## 1. Summary

A bilingual (Indonesian default / English), SEO-first, static marketing site
for a family-owned durian farm in North Sumatra, built with Astro 7. No
backend, no payments — the only conversion path is a WhatsApp deep link.
Full PRD lives in the original conversation; this spec resolves the concrete
implementation decisions and locks in content sourced from the approved
design mockup (`Durian Sri Raja Premium Website/Durian Sri Raja.dc.html`).

## 2. Tech stack (hard constraints)

- Astro 7, `output: 'static'`, TypeScript strict. Node >= 22.12.
- Content collections via the **Content Layer API**:
  - Config in `src/content.config.ts` (not `src/content/config.ts`).
  - `loader: glob({ pattern, base })` from `astro/loaders`, no `type: 'content'`.
  - Entry slug is `entry.id` — there is no `.slug`.
  - Render with `import { render } from 'astro:content'; const { Content } = await render(entry)` — not `entry.render()`.
  - Query with `getCollection` / `getEntry` — no `getEntryBySlug`.
- `<ClientRouter />` from `astro:transitions` if page transitions are used (not `<ViewTransitions />`). Not required for v1; content pages ship with zero client JS.
- `z` imported from `astro:content` for schemas.
- Tailwind CSS v4 via `@tailwindcss/vite`.
- `@astrojs/sitemap` for sitemap generation with i18n alternates.
- `astro:assets` (`<Image>` / `<Picture>`) for any real images added later.
- Dev server: run with `ASTRO_DEV_BACKGROUND=false astro dev` so it doesn't detach.

## 3. i18n

- Locales: `['id', 'en']`, `defaultLocale: 'id'`.
- Routing: `prefixDefaultLocale: false` → Indonesian at `/`, English at `/en/`.
- Set `redirectToDefaultLocale` explicitly (Astro 6+ changed its default) — set to `false`, root `/` already serves `id` directly.
- UI string dictionary: `src/i18n/ui.ts` (nav labels, buttons, footer strings, section kickers — everything that isn't per-variety content). Content is sourced verbatim from the mockup's `EN` / `ID` objects.
- Helpers in `src/i18n/utils.ts`: `getLangFromUrl(url)`, `useTranslations(lang)`, `getLocalizedPath(path, lang)`.
- Language switcher in header and footer (mirrors mockup), preserves the current page by mapping the current route to its counterpart locale path.
- `hreflang` alternates (`id`, `en`, `x-default` → `id`) on every page via the shared `<SEO>` component.

## 4. Content model

### `varieties` collection

Location: `src/content/varieties/{slug}/{locale}.md` (one Markdown file per
variety per locale, e.g. `src/content/varieties/musang-king/id.md` and
`.../musang-king/en.md`), loaded with `glob({ pattern: '*/*.md', base: './src/content/varieties' })`.

Schema (`src/content.config.ts`):

```ts
varieties: defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/varieties' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    flavorProfile: z.object({
      sweetness: z.number().int().min(1).max(10),
      bitterness: z.number().int().min(1).max(10),
      creaminess: z.number().int().min(1).max(10),
    }),
    season: z.string(),
    grade: z.string(),
    origin: z.string(),
    priceNote: z.string(),
    images: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
})
```

Note: mockup scores are on a 1–10 scale (not 1–5 as the original PRD draft
said) — 10-point scale is adopted since it matches the real content and
renders identically as percentage-width bars.

Entry `id` shape is `"{slug}/{locale}"` (e.g. `musang-king/id`); pages derive
the slug by splitting on `/`.

### Seed data — 6 varieties, both locales, real copy from the mockup

1. `musang-king` — Grade A+, Jun–Sep, sweetness 8 / bitterness 7 / creaminess 9, featured, order 1
2. `black-thorn` — Grade A+, Jul–Sep, 9/5/10, featured, order 2
3. `d24` — Grade A, Jun–Oct, 7/6/8, featured, order 3
4. `tekka` — Grade A, Jun–Aug, 6/7/6, order 4
5. `red-prawn` — Grade A, Jul–Sep, 10/3/8, order 5
6. `durian-kampung` — Heritage, May–Aug, 6/8/6, order 6

All names, taglines, descriptions, specs, and prices are copied verbatim
(EN and ID) from the `VARIETIES`/`EN`/`ID` objects in the mockup script —
not reinvented. "Featured" = first 3 (matches mockup's `featured: varieties.slice(0,3)`).

## 5. Design system

Sourced directly from the approved mockup.

- **Colors**: cream `#F7F2E7` (page bg), charcoal `#1F1E1B` (body text), deep
  green `#1C3327` (dark sections, active nav), near-black green `#14251C`
  (footer, button text-on-gold), deepest green `#0B1611` (hero gradient
  base), gold `#C8963E` (primary CTA fill), light gold `#E3C07A` (hover /
  highlight / selection), muted gold `#8A6A24` (labels, links), border gold
  `#A8842F`, card white `#FFFCF5`, muted text tones `#5C5949` / `#4A4839` /
  `#3D3B2F` / `#8A8372`.
- **Fonts**: Prata (serif, all headings) + Karla (sans, body/UI), loaded via
  `@fontsource/prata` and `@fontsource/karla` (bundled, no external Google
  Fonts request at runtime — better for the zero-client-JS/perf goals).
- **Motifs**: pill-shaped buttons and badges, a leaf-mark logo (a square with
  `border-radius: 0 100% 0 100%`), diagonal-stripe placeholder-image pattern,
  gold gradient flavor-profile bars, alternating left/right story blocks,
  sticky translucent header.
- These become Tailwind v4 theme tokens (`@theme` block in `src/styles/global.css`) named semantically: `--color-cream`, `--color-charcoal`, `--color-forest`, `--color-forest-dark`, `--color-gold`, `--color-gold-light`, `--color-gold-muted`, `--color-card`, etc.

## 6. Placeholder images

A reusable `<PlaceholderImage caption="..." aspect="4/3" />` component
renders the mockup's diagonal-stripe swatch (CSS `repeating-linear-gradient`)
with a small monospace caption describing the intended shot (e.g. "hero
photo — durian split open, husk + golden flesh, low light" — copied from the
mockup where present, written fresh for spots the mockup doesn't cover).
A one-line `TODO:` comment sits next to each usage explaining that dropping
a real file into `src/assets/` and swapping in `astro:assets`'s `<Image>`
is a drop-in replacement — no other code changes needed.

## 7. Pages (both locales)

1. **Home** (`/`, `/en/`) — hero w/ WhatsApp CTA + "browse varieties", promise
   strip (4 items), featured varieties grid (3 cards), story teaser
   (image + text + link), "why buyers come back" (3 reasons), export callout
   (text + CTA + 4 stat tiles).
2. **Varieties** (`/varietas/`, `/en/varieties/`) — kicker, H1, intro copy,
   grid of all 6 varieties sorted by `order`.
3. **Variety detail** (`/varietas/[slug]/`, `/en/varieties/[slug]/`) — via
   `getStaticPaths` iterating both locales' entries; hero, flavor-profile
   bars, spec sheet aside, price note, WhatsApp CTA pre-filled with the
   variety name, `Product` JSON-LD.
4. **Our Story** (`/kisah-kami/`, `/en/our-story/`) — lede, 4 alternating
   story blocks (1978 / 1994 / 2012 / Today, verbatim from mockup), closing
   quote block.
5. **Export & Shipping** (`/ekspor/`, `/en/export/`) — lede, 6 export-info
   blocks (grading, packing, cold chain, documentation, minimum order,
   destinations), grading-standard table (4 grades), enquiry CTA block.
6. **Contact** (`/kontak/`, `/en/contact/`) — WhatsApp CTA, address/phone/
   email (from mockup footer), hours, embedded Google Maps iframe (query:
   "Sibolangit, Deli Serdang, Sumatera Utara"). No contact form — WhatsApp
   is the only conversion path, per non-goals (zero backend).
7. **Custom 404** — bilingual-friendly (detect locale from path prefix),
   link back home.

Locale-specific slugs (`/varietas/` vs `/en/varieties/`, `/kisah-kami/` vs
`/en/our-story/`, `/ekspor/` vs `/en/export/`, `/kontak/` vs `/en/contact/`)
follow the mockup's Indonesian nav labels for better local-market SEO, with
English equivalents for the `/en/` tree.

## 8. WhatsApp integration

- `src/config.ts`: `WHATSAPP_NUMBER = '6281260001978'` (placeholder, intl
  format, no `+`/spaces — required by `wa.me`).
- `waLink(message: string): string` → `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`.
- Per-locale message templates in `src/i18n/ui.ts`, e.g.
  `id: (name) => \`Halo, saya tertarik dengan ${name}\`` /
  `en: (name) => \`Hi, I'm interested in ${name}\``, plus a generic
  home-page message and an export-desk message (mirrors mockup's `waCta` /
  `waExport`).
- Reusable `<WhatsAppButton message={...} variant="primary"|"outline" />`
  component (pill button, gold fill, small dot icon — matches mockup).

## 9. SEO implementation

- Shared `<SEO>` (BaseHead) component: `<title>`, meta description,
  canonical, OpenGraph (title/description/image/locale), Twitter card
  (`summary_large_image`), hreflang alternates (id/en/x-default) — takes
  page-specific props, used once per layout.
- JSON-LD:
  - `LocalBusiness` (`@type: FoodEstablishment`) — sitewide, injected in the
    base layout, using the mockup's real address/phone.
  - `Product` — on each variety detail page (name, description, offers
    with `priceCurrency: IDR` where a numeric price is parseable, otherwise
    omit `price` and keep `availability`).
  - `BreadcrumbList` — on variety detail, story, export, and contact pages.
- `@astrojs/sitemap` configured with `i18n: { defaultLocale: 'id', locales: { id: 'id', en: 'en' } }` so alternates are generated automatically.
- `robots.txt` (static, references sitemap URL).
- Semantic HTML: one `<h1>` per page, descriptive `alt` text on every
  `<PlaceholderImage>`/`<Image>`, logical heading order.

## 10. Non-functional

- Mobile-first Tailwind breakpoints; layouts already responsive in the
  mockup's grid patterns (`repeat(auto-fit, minmax(...))`).
- Zero client-side JS on content pages (no framework islands needed — all
  interactivity is CSS `:hover` and native links/anchors; the language
  switcher and nav are plain links, not client state).
- WCAG AA: color contrast checked for gold-on-cream and cream-on-green
  combinations from the mockup (all pass at the sizes used); focus-visible
  states added (mockup only defines hover, not focus — this spec adds
  `:focus-visible` outlines using the gold token, since the mockup is a
  prototype without keyboard-nav handling).
- Editable by non-devs: adding a variety = adding two Markdown files, no
  code changes.

## 11. README requirements

Covers: setup (`npm install`, `ASTRO_DEV_BACKGROUND=false npm run dev`), how
to add a variety (create `src/content/varieties/<slug>/{id,en}.md`), how to
swap a placeholder image (drop file in `src/assets/`, replace
`<PlaceholderImage>` with `<Image>`), how to set the real WhatsApp number
(`src/config.ts`), how to set the real domain (`astro.config.mjs` `site`
field + `public/robots.txt`), and deploy notes for Cloudflare Pages
(build command `astro build`, output `dist/`, Node 22).

## 12. Out of scope (unchanged from PRD)

No payments/cart, no user accounts/reviews/blog CMS, no real-time inventory
or delivery tracking, no contact form/backend.

## 13. Open items resolved during brainstorming

- **6 varieties with real mockup copy**, not 4 placeholder ones — richer,
  already bilingual, no invented content needed.
- **Flavor profile scale is 1–10**, not 1–5 (matches mockup data).
- **Contact page has no form** — WhatsApp-only, keeps the "no backend"
  constraint airtight; a `mailto:` link may be added trivially later if
  wanted.
- **Fonts self-hosted via Fontsource** rather than a Google Fonts `<link>`,
  to keep the perf/zero-runtime-request goals intact (mockup used a Google
  Fonts link since it's a throwaway prototype).

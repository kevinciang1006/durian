# Durian Sriraja Website — Design Spec

Date: 2026-09-16 (revised same day — content overhaul)
Status: Approved by user, ready for implementation planning

## 1. Summary

A bilingual (Indonesian default / English), SEO-first, static marketing site
for a young family-run durian orchard in Bukit Lawang, North Sumatra, built
with Astro 7. No backend, no payments — the only conversion path is a
WhatsApp deep link. Visual design (colors, fonts, layout patterns, component
motifs) is sourced from the approved mockup
(`Durian Sri Raja Premium Website/Durian Sri Raja.dc.html`). **All written
content has since been replaced** with the family's real story and brand
voice, supplied directly by the user — see §4 and §7. The mockup's narrative
content (Sibolangit, 1978 founding, established export operation) is no
longer used; only its visual design system survives.

**Brand name**: "Durian Sriraja" (one word "Sriraja"), per the user-supplied
copy — supersedes the mockup's "Durian Sri Raja" (two words). Use "Sriraja"
consistently in `<title>`, header/footer logo lockup, JSON-LD, and all copy.

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
- `astro:assets` (`<Image>` / `<Picture>`) for all images, including the placeholders (see §6).
- Dev server: run with `ASTRO_DEV_BACKGROUND=false astro dev` so it doesn't detach.

## 3. i18n

- Locales: `['id', 'en']`, `defaultLocale: 'id'`.
- Routing: `prefixDefaultLocale: false` → Indonesian at `/`, English at `/en/`.
- Set `redirectToDefaultLocale` explicitly (Astro 6+ changed its default) — set to `false`, root `/` already serves `id` directly.
- UI string dictionary: `src/i18n/ui.ts` (nav labels, buttons, footer strings, section kickers — everything that isn't per-variety content).
- Helpers in `src/i18n/utils.ts`: `getLangFromUrl(url)`, `useTranslations(lang)`, `getLocalizedPath(path, lang)`.
- Language switcher in header and footer, preserves the current page by mapping the current route to its counterpart locale path.
- `hreflang` alternates (`id`, `en`, `x-default` → `id`) on every page via the shared `<SEO>` component.

## 4. Content model

### `varieties` collection

Location: `src/content/varieties/{locale}/{slug}.md` — one Markdown file per
variety per locale, grouped by locale folder (matches the files the user
supplied verbatim), e.g. `src/content/varieties/id/musang-king.md` and
`src/content/varieties/en/musang-king.md`.

Loader: `glob({ pattern: '*/*.md', base: './src/content/varieties' })`.

Entry `id` shape is `"{locale}/{slug}"` (e.g. `id/musang-king`). A small
helper `getVarietiesForLocale(locale)` in `src/content/utils.ts` filters
`entry.id.startsWith(\`${locale}/\`)` and derives `slug` via
`entry.id.split('/')[1]`, sorted by `data.order`.

Schema (`src/content.config.ts`):

```ts
varieties: defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/varieties' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    flavorProfile: z.object({
      sweetness: z.number().int().min(1).max(5),
      bitterness: z.number().int().min(1).max(5),
      creaminess: z.number().int().min(1).max(5),
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

Flavor scale is **1–5** (reverted to the original PRD scale — the mockup's
1–10 scale is no longer used since the real variety data is on 1–5). Bars
render at `score * 20`% width.

### Seed data — 5 confirmed varieties, both locales, verbatim user copy

1. `musang-king` — Premium, sweetness 4 / bitterness 4 / creaminess 5, featured, order 1
2. `black-thorn` — Premium, 5/3/5, featured, order 2
3. `monthong` — Premium, 4/1/3, order 3
4. `sultan` (D24) — Premium, 3/4/4, order 4
5. `chanee` — Premium, 4/2/4, order 5

All `name`, `tagline`, `season`, `grade`, `origin`, `priceNote`, and body
copy (ID and EN) are taken verbatim from the markdown the user supplied.
There is no longer a pending 6th variety — adding future varieties later is
just two new markdown files, no code changes (this is the collection's
whole point).

`images` for every seed entry points to `/images/placeholder-durian.jpg`
(see §6) with a variety-specific `alt` text, exactly as supplied.

"Featured" (shown on Home) = `musang-king` and `black-thorn`, matching the
user's `featured: true` flags.

## 5. Design system

Visual design only — sourced from the approved mockup. Copy/voice is
separate (§7) and no longer tied to the mockup's narrative.

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
  `border-radius: 0 100% 0 100%`), gold gradient flavor-profile bars,
  alternating left/right story blocks, sticky translucent header. Emoji used
  as inline icons for the Home page's brand-promise bullets (🌳 🌧️ 👨‍👩‍👦),
  matching the user-supplied copy exactly rather than the mockup's diamond
  bullets.
- These become Tailwind v4 theme tokens (`@theme` block in `src/styles/global.css`) named semantically: `--color-cream`, `--color-charcoal`, `--color-forest`, `--color-forest-dark`, `--color-gold`, `--color-gold-light`, `--color-gold-muted`, `--color-card`, etc.

## 6. Placeholder images

Decision (revised): use **real placeholder image files**, not the mockup's
CSS stripe-pattern component — the user's variety markdown already
references real paths (`/images/placeholder-durian.jpg`).

- `public/images/placeholder-durian.jpg` — one generic, license-free durian
  photo (or a simple flat-color graphic if no free photo is sourced) used by
  every variety entry's `images[0].src`.
- 1–2 additional generic placeholders for non-variety spots: a farm/hero
  shot (`public/images/placeholder-farm.jpg`) for the Home hero and Our
  Story blocks, and one for the Contact/Export pages if needed
  (`public/images/placeholder-orchard.jpg`).
- Rendered via `astro:assets`'s `<Image>` (or plain `<img>` for files served
  from `public/`, since `astro:assets` optimization requires images under
  `src/`) — whichever keeps the "drop in a real photo, no code change"
  promise simplest; final call made during implementation, documented in
  the README either way.
- A one-line `TODO:` comment sits next to each usage explaining that
  swapping in a real photo is just replacing the file at the same path (or
  updating `images[0].src` in the variety's markdown).

## 7. Pages (both locales)

Copy below is final and verbatim where supplied by the user; sections
marked "(spec-authored, matching approved voice)" are new copy written to
extend the pattern into pages the user didn't draft, following the same
plain, patient, non-corporate voice as the approved copy — treat as a
first draft, easy to hand-edit later since it's plain Markdown/strings.

### 7.1 Home (`/`, `/en/`)

Sections, in order:
1. **Hero** — title + body + two CTAs (WhatsApp order / view varieties).
2. **Brand promise** — 3 bullets with emoji icons (farm-direct, grown in
   Bukit Lawang, family-run).
3. **Why us** — kicker + title + two paragraphs (rainforest orchard, farm-
   direct, fresh-in-season/frozen-off-season).
4. **Story teaser** — title + paragraph + "Read Our Story" link.
5. **International callout** — title + paragraph + "Learn More" link (→ Export & Partnerships page).
6. **Featured varieties** — grid of the 2 featured entries (`musang-king`, `black-thorn`) — *(spec-authored placement: the user's copy doesn't call this out explicitly as a section, but featured-variety cards are needed somewhere for the Varieties collection to be discoverable from Home and for internal linking/SEO; placed between the International Callout and Final CTA)*.
7. **Final CTA** — closing question + single WhatsApp button.

Full copy (ID):

- Hero: "Raja Durian dari Rimba Bukit Lawang" / "Durian premium langsung dari kebun keluarga kami, tumbuh di jantung hutan Bukit Lawang, Sumatera Utara. Musang King, Black Thorn, Monthong, dan lainnya — segar dari pohon." / CTAs: "Pesan via WhatsApp", "Lihat Jenis Durian"
- Brand promise: "🌳 Langsung dari Kebun — tanpa perantara, panen sendiri" / "🌧️ Ditanam di Bukit Lawang — tanah subur di tepi Taman Nasional Gunung Leuser" / "👨‍👩‍👦 Kebun Keluarga — dikelola langsung oleh keluarga kami"
- Why us: "Kenapa Durian Sriraja?" / "Kami bukan penjual durian biasa. Kebun kami tumbuh di dalam rimba Bukit Lawang — salah satu hutan hujan tertua di dunia. Setiap buah dipanen dari pohon kami sendiri dan dikirim segar, bukan lewat rantai distributor yang panjang." / "Saat musim panen, durian tersedia segar dan dikemas rapi. Di luar musim, kami sediakan durian beku berkualitas agar Anda tetap bisa menikmatinya kapan saja."
- Story teaser: "Dari Retret ke Kebun Durian" / "Keluarga kami menjalankan tempat retret mindfulness di Bukit Lawang. Kebun durian ini lahir dari kecintaan yang sama terhadap alam dan kesabaran — menanam pohon hari ini untuk buah bertahun-tahun ke depan." / "Baca Cerita Kami"
- International callout: "Pembeli dari Luar Negeri?" / "Kami menyambut pembeli dan mitra internasional. Kunjungi kebun, cicipi langsung, atau diskusikan kemitraan jangka panjang." / "Pelajari Lebih Lanjut"
- Final CTA: "Mau pesan durian premium langsung dari kebun?" / "Pesan via WhatsApp"

Full copy (EN): mirrors the above 1:1 — "The King of Durians, from the
Bukit Lawang Rainforest" / hero body, brand promise bullets, "Why Durian
Sriraja?" body, "From a Retreat to a Durian Orchard" story teaser, "Buying
from Overseas?" callout, closing "Want premium durian straight from the
farm?" CTA — exact text as supplied by the user in the brainstorming
conversation.

### 7.2 Varieties listing (`/varietas/`, `/en/varieties/`)

*(spec-authored)* Kicker "Varietas Kami" / "Our Varieties"; title "Lima
Varietas Premium, Satu Kebun Muda" / "Five Premium Varieties, One Young
Orchard"; short intro noting each variety is grown on the family's own land
in Bukit Lawang and graded honestly since the orchard is still building its
track record. Grid of all 5 seeded varieties sorted by `order`.

### 7.3 Variety detail (`/varietas/[slug]/`, `/en/varieties/[slug]/`)

Via `getStaticPaths` iterating both locales' entries; hero (placeholder
image), flavor-profile bars (1–5 scale), spec sheet aside (origin, season,
grade), price note ("Harga pasar — hubungi via WhatsApp" / "Market price —
contact via WhatsApp"), WhatsApp CTA pre-filled with the variety name,
`Product` JSON-LD (no numeric `price` since none is published — `offers`
uses `availability` only).

### 7.4 Our Story (`/cerita-kami/`, `/en/our-story/`)

Full verbatim copy, 5 sections + closing WhatsApp CTA:

1. **Berawal dari Bukit Lawang / It Began in Bukit Lawang** — family lives
   in Bukit Lawang beside Gunung Leuser National Park; parents **Susanto
   Ciang** and **Sri Astuti** run a mindfulness retreat there.
2. **Kenapa Durian / Why Durian** — durian-growing as an act of patience;
   planting began **2021** on **8 hectares** with **700+ premium trees**.
3. **Kebun yang Sedang Tumbuh / A Growing Orchard** — young orchard,
   Musang King / Black Thorn / Monthong planted, now entering first
   premium harvests.
4. **Nama Kami / Our Name** — "Sri Raja" means both the family name and
   "king of fruits" — note this section keeps the two-word "Sri Raja" as a
   *name-origin explanation*, distinct from the one-word "Sriraja" brand
   spelling used everywhere else; this is intentional wordplay in the
   user's own copy and should render exactly as supplied.
5. **Sebuah Undangan / An Invitation** — best enjoyed on-site; orchard is a
   ~30 minute walk through jungle and across rivers from the retreat;
   invites visitors willing to make the trip.
6. Closing: WhatsApp CTA button.

(Full ID/EN text as supplied verbatim in the brainstorming conversation —
copied as-is into the page's Markdown/component content, not paraphrased.)

### 7.5 Export & Partnerships (`/ekspor/`, `/en/export/`)

**Rewritten** from the original mockup-derived draft to match the young-
farm story — no fabricated export track record, cold-chain infrastructure,
or named destination markets. Renamed conceptually to "Export &
Partnerships" to reflect that this is about welcoming early relationships,
not describing an established logistics operation (URL slugs unchanged:
`/ekspor/`, `/en/export/`).

*(spec-authored, matching approved voice)*

ID:
- Kicker: "Ekspor & Kemitraan"
- Title: "Menyambut Pembeli dan Mitra dari Luar Negeri"
- Lede: "Kebun kami masih muda, dan kami membangunnya bersama pembeli yang menghargai perjalanan itu sejak awal. Kami menyambut importir, distributor, dan mitra jangka panjang yang ingin bertumbuh bersama kami."
- Blocks:
  1. "Kunjungi Kebun" — "Cara terbaik mengenal durian kami adalah datang langsung. Kami mengatur kunjungan kebun bagi calon mitra dan pembeli, termasuk mencicipi buah langsung dari pohon."
  2. "Panen Musiman" — "Sebagai kebun muda, kami baru memasuki musim panen premium pertama. Ketersediaan mengikuti musim buah yang sesungguhnya, bukan produksi massal."
  3. "Segar & Beku" — "Saat musim panen, kami kirim durian segar yang dikemas rapi. Di luar musim, tersedia durian beku berkualitas untuk permintaan yang berkelanjutan."
  4. "Kemitraan Jangka Panjang" — "Kami mencari mitra distribusi dan ekspor yang ingin membangun hubungan jangka panjang seiring kebun kami bertumbuh, bukan transaksi satu kali."
- Enquiry CTA: "Ingin Menjajaki Kemitraan?" / "Ceritakan kebutuhan Anda — negara tujuan, perkiraan volume, atau rencana kunjungan. Kami akan balas dan atur langkah berikutnya." / Button: "Hubungi via WhatsApp"

EN: mirrors 1:1 — "Export & Partnerships" kicker, "Welcoming Overseas
Buyers and Partners" title, lede about building relationships from the
start, blocks "Visit the Farm" / "Seasonal Harvests" / "Fresh & Frozen" /
"Long-Term Partnerships", enquiry "Want to Explore a Partnership?" / body /
"Message Us on WhatsApp".

The mockup's 4-tier grading table (Grade A+/A/B/Heritage) is **dropped** —
all current varieties share one `grade: "Premium"` value, so a comparative
table would be fabricated. Replaced with a short paragraph on how fruit is
selected (hand-picked, tree-ripened) instead of a tiered spec table.

### 7.6 Contact (`/kontak/`, `/en/contact/`)

Final verbatim copy, 4 sections + closing map link (no contact form, no
email address — the user's copy only lists WhatsApp and location; the
farm is by-appointment-only since the orchard itself is off-grid):

1. **Lede** — "want to order or visit? WhatsApp is the fastest way to
   reach us" + WhatsApp CTA button.
2. **Farm location** — Bukit Lawang, Kabupaten Langkat, Sumatera Utara, on
   the edge of Gunung Leuser National Park.
3. **Farm visits** — welcomes visitors; notes the ~30-minute jungle/river
   walk to the orchard and comfortable footwear; by appointment only via
   WhatsApp.
4. **Get in touch** — WhatsApp number `+62 831-9411-1119`; location repeat.
5. **"Open Map" link** — pins the **Bukit Lawang village entrance** as the
   meeting point (not the orchard itself, which is off-grid):
   `https://maps.google.com/?q=Bukit+Lawang,+Langkat,+North+Sumatra`.

(Full ID/EN text as supplied verbatim in the brainstorming conversation —
copied as-is into the page's content, not paraphrased.)

### 7.7 Custom 404

Bilingual-friendly (detect locale from path prefix), link back home.

Locale-specific slugs: `/varietas/` ↔ `/en/varieties/`, `/cerita-kami/` ↔
`/en/our-story/` (per the user's supplied route), `/ekspor/` ↔ `/en/export/`,
`/kontak/` ↔ `/en/contact/`.

## 8. WhatsApp integration

- `src/config.ts`: `WHATSAPP_NUMBER = '6283194111119'` (real number, from
  `+62 831-9411-1119`, converted to `wa.me`'s required format: country code
  + subscriber number, no `+`/spaces/dashes).
- `waLink(message: string): string` → `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`.
- Per-locale message templates in `src/i18n/ui.ts`:
  - Home / generic: id `"Halo, saya tertarik dengan durian dari Kebun Sriraja"` / en `"Hi, I'm interested in durian from Sriraja Farm"`.
  - Variety detail: id `` `Halo, saya tertarik dengan ${name}` `` / en `` `Hi, I'm interested in ${name}` ``.
  - Export/partnership desk: id `"Halo, saya ingin menjajaki kemitraan/ekspor dengan Kebun Sriraja"` / en `"Hi, I'd like to discuss an export/partnership opportunity with Sriraja Farm"`.
- Reusable `<WhatsAppButton message={...} variant="primary"|"outline" />`
  component (pill button, gold fill, small dot icon — matches mockup's visual style).

## 9. SEO implementation

- Shared `<SEO>` (BaseHead) component: `<title>`, meta description,
  canonical, OpenGraph (title/description/image/locale), Twitter card
  (`summary_large_image`), hreflang alternates (id/en/x-default) — takes
  page-specific props, used once per layout.

### 9.1 Page meta (`src/i18n/meta.ts`)

Static pages (home, varieties, story, international, contact) source
`title`/`description` from a locale → page keyed object, exactly as
supplied by the user:

```ts
export const meta = {
  id: {
    home: { title: "Durian Sriraja — Durian Premium Bukit Lawang, Sumatera Utara", description: "..." },
    varieties: { title: "Jenis Durian Premium Kami | Durian Sriraja Bukit Lawang", description: "..." },
    story: { title: "Cerita Kami — Kebun Durian di Rimba Bukit Lawang", description: "..." },
    international: { title: "Pembeli Internasional — Durian Premium Indonesia | Sriraja", description: "..." },
    contact: { title: "Kontak & Kunjungan Kebun | Durian Sriraja Bukit Lawang", description: "..." },
  },
  en: { /* mirrors id, English copy */ },
} as const;
```

(Full title/description strings as supplied verbatim by the user — see
brainstorming conversation; copied into `src/i18n/meta.ts` as-is.) Each
static page imports its `meta[lang].<page>` entry and passes it to `<SEO>`.
Note: the "international" key is the Export & Partnerships page's meta
entry (naming carried over from the user's `meta.ts` draft).

Variety detail pages **generate** their meta from frontmatter instead of a
static table (avoids hand-writing 2×5 more entries and staying in sync as
varieties are added):

- `id` title: `` `${name} — Durian Premium Bukit Lawang | Durian Sriraja` ``
- `en` title: `` `${name} Durian — Premium from Bukit Lawang | Durian Sriraja` ``
- description: `` `${tagline} — ${origin}` ``
- OpenGraph image: the variety's `images[0]`.

### 9.2 JSON-LD

- `LocalBusiness` (`@type: FoodEstablishment`) — sitewide, injected in the
  base layout: `name: "Durian Sriraja"`, address Bukit Lawang / Kabupaten
  Langkat / North Sumatra, `geo` (approximate Bukit Lawang coordinates),
  `areaServed` (Indonesia + the region generally, not the fabricated
  destination-market list from the old mockup), `sameAs` — **needs the
  farm's real Instagram URL from the user before launch**; ships as an
  empty array (or the property omitted) until supplied, not a fabricated
  link.
- `Product` — on each variety detail page: `name`, `description`, `brand`
  (`"Durian Sriraja"`), `image` (the variety's placeholder/real photo),
  `offers.availability` only (no numeric `price`).
- `BreadcrumbList` — on variety detail, story, export, and contact pages.

### 9.3 Sitemap & robots

- `@astrojs/sitemap` configured with `i18n: { defaultLocale: 'id', locales: { id: 'id', en: 'en' } }` so alternates are generated automatically.
- `robots.txt` (static): allow all, references the sitemap URL.

### 9.4 Baseline

Semantic HTML: one `<h1>` per page, descriptive `alt` text on every image,
logical heading order.

## 10. Non-functional

- Mobile-first Tailwind breakpoints; layouts already responsive in the
  mockup's grid patterns (`repeat(auto-fit, minmax(...))`).
- Zero client-side JS on content pages (no framework islands needed — all
  interactivity is CSS `:hover` and native links/anchors; the language
  switcher and nav are plain links, not client state).
- WCAG AA: color contrast checked for gold-on-cream and cream-on-green
  combinations from the mockup (all pass at the sizes used); focus-visible
  states added (mockup only defines hover, not focus — this spec adds
  `:focus-visible` outlines using the gold token).
- Editable by non-devs: adding a variety = adding two Markdown files, no
  code changes.

## 11. README requirements

Covers: setup (`npm install`, `ASTRO_DEV_BACKGROUND=false npm run dev`), how
to add a variety (create `src/content/varieties/{id,en}/<slug>.md`), how to
swap a placeholder image (replace the file under `public/images/` or
`src/assets/`, keeping the same filename/path), how to set the real
WhatsApp number (`src/config.ts`), how to set the real domain
(`astro.config.mjs` `site` field + `public/robots.txt`), how to add the
farm's Instagram URL to the `LocalBusiness` JSON-LD `sameAs` field, and
deploy notes for Cloudflare Pages (build command `astro build`, output
`dist/`, Node 22).

## 12. Out of scope (unchanged from PRD)

No payments/cart, no user accounts/reviews/blog CMS, no real-time inventory
or delivery tracking, no contact form/backend.

## 13. Open items resolved during brainstorming (updated)

- **All narrative content replaced** with the user's real brand story
  (Bukit Lawang, founded 2021, parents Susanto Ciang & Sri Astuti, family
  mindfulness retreat) — the mockup's Sibolangit/1978/export-history
  narrative is discarded; only its visual design system is kept.
- **Brand name is "Durian Sriraja"** (one word), not "Durian Sri Raja" —
  except inside the Our Story "Our Name" section, which deliberately plays
  on the two-word etymology and is quoted verbatim.
- **5 confirmed varieties** (Musang King, Black Thorn, Monthong, Sultan/D24,
  Chanee) seeded now — no more pending varieties for v1.
- **Flavor profile scale is 1–5**, per the user's actual data (reverting
  the earlier 1–10 decision, which was based on the now-discarded mockup
  content).
- **Export page rewritten** to match the young-farm story: no fabricated
  export history, cold-chain claims, or destination-market list; reframed
  as "Export & Partnerships" welcoming early relationships. The mockup's
  4-tier grading table is dropped (all current varieties are one grade).
- **Placeholder images are real files** (`public/images/placeholder-*.jpg`),
  not the mockup's CSS stripe-pattern component, since the user's content
  already references real image paths.
- **Contact page finalized**: real WhatsApp number (`+62 831-9411-1119`),
  location given as the Bukit Lawang village area (the orchard itself is
  off-grid, ~30 min walk from a meeting point), "Open Map" links to the
  village entrance, not a precise orchard pin. No email address is
  published — matches the user's copy.
- **Contact page has no form** — WhatsApp-only, keeps the "no backend"
  constraint airtight; a `mailto:` link may be added trivially later if
  wanted.
- **`src/i18n/meta.ts` added** with real per-page `<title>`/description
  copy (keyword-loaded for local + export intent); variety detail pages
  generate their own meta from frontmatter rather than a hand-written
  table. JSON-LD `sameAs` (Instagram) is left empty pending the user's real
  URL — not fabricated.
- **Fonts self-hosted via Fontsource** rather than a Google Fonts `<link>`,
  to keep the perf/zero-runtime-request goals intact.

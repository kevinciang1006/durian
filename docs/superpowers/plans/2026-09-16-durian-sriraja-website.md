# Durian Sriraja Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full bilingual (ID/EN), SEO-first, static Durian Sriraja marketing website in Astro 7, from empty repo to a deployable `dist/` build with all 7 page-types, 5 seeded varieties, WhatsApp CTAs, and complete SEO wiring.

**Architecture:** Astro 7 static site (`output: 'static'`), Content Layer API for the `varieties` collection, native Astro i18n routing (`id` at `/`, `en` at `/en/`), Tailwind v4 for styling, zero client-side JS on content pages (one small inline script on the 404 page is the only exception). Bilingual page copy lives inline in per-page `*Content.astro` components as `{ id: {...}, en: {...} }` objects; UI chrome strings (nav, WhatsApp templates, footer) live in `src/i18n/ui.ts`.

**Tech Stack:** Astro 7 (TypeScript strict), Tailwind CSS v4 (`@tailwindcss/vite`), `@astrojs/sitemap`, Fontsource (Prata + Karla), Vitest for pure-logic unit tests, Node >= 22.12.

**Spec:** `docs/superpowers/specs/2026-09-16-durian-sri-raja-website-design.md` (as revised through the brainstorming conversation — brand name "Durian Sriraja", Bukit Lawang story, 5 confirmed varieties, rewritten Export & Partnerships page, real placeholder images, finalized Contact page and `meta.ts`).

## Global Constraints

- Node >= 22.12. Dev server MUST be run as `ASTRO_DEV_BACKGROUND=false astro dev` (Astro 7 detaches into a background daemon otherwise).
- Content collections use the Content Layer API: config at `src/content.config.ts` (top-level, not `src/content/config.ts`), `loader: glob({...})` from `astro/loaders`, no `type: 'content'`. Entry slug is `entry.id` (no `.slug`). Render with `import { render } from 'astro:content'; const { Content } = await render(entry)`. Query with `getCollection`/`getEntry` (no `getEntryBySlug`). Import `z` from `astro:content`.
- i18n: locales `['id', 'en']`, `defaultLocale: 'id'`, `routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false }`. Indonesian at `/`, English at `/en/`.
- Brand name is **"Durian Sriraja"** (one word "Sriraja") everywhere except the Our Story "Our Name" section, which deliberately quotes the two-word "Sri Raja" etymology verbatim.
- `WHATSAPP_NUMBER = '6283194111119'` (from the real number `+62 831-9411-1119`).
- Flavor profile scale is **1–5** (not 1–10).
- 5 confirmed varieties, no more pending: Musang King, Black Thorn, Monthong, Sultan (D24), Chanee.
- Placeholder images are real JPG files under `public/images/`, referenced by plain `<img>` tags (not `astro:assets` `<Image>` — those files live in `public/`, outside Astro's optimized-asset pipeline, and the content frontmatter already references them by absolute public path). `loading="lazy"` on every below-the-fold image; hero images are eager (no `loading` attribute).
- No contact form, no payments, no CMS/blog, no user accounts — WhatsApp is the only conversion path.
- Site domain placeholder: `https://duriansriraja.com` (set in `astro.config.mjs`'s `site` field from Task 1 onward — `BaseHead`'s canonical/hreflang logic depends on `Astro.site` being set).

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `src/pages/index.astro`
- Create: `.gitignore` (already exists from the brainstorming phase — leave as-is)

**Interfaces:**
- Produces: a buildable Astro project (`npm run build` succeeds), `npm run dev` script, `npm run test` (vitest) script.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "durian-sriraja",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ASTRO_DEV_BACKGROUND=false astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "sync": "astro sync",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^7.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@fontsource/prata": "^5.0.0",
    "@fontsource/karla": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Write a minimal `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duriansriraja.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Write a placeholder `src/pages/index.astro`**

```astro
---
---
<html>
  <head><title>Durian Sriraja</title></head>
  <body><h1>Coming soon</h1></body>
</html>
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: installs without error.

- [ ] **Step 6: Verify the project builds**

Run: `npm run build`
Expected: exits 0, creates `dist/index.html` containing `<h1>Coming soon</h1>`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs src/pages/index.astro
git commit -m "Scaffold Astro 7 project"
```

---

## Task 2: i18n plumbing — `ui.ts` + `utils.ts`

**Files:**
- Create: `src/i18n/ui.ts`
- Create: `src/i18n/utils.ts`
- Create: `vitest.config.ts`
- Test: `tests/i18n.test.ts`
- Modify: `astro.config.mjs` (add `i18n` block)

**Interfaces:**
- Produces: `type Locale = 'id' | 'en'`; `ui: Record<Locale, {...}>`; `getLangFromUrl(url: URL): Locale`; `useTranslations(lang: Locale): typeof ui[Locale]`; `getLocalizedPath(routeKey: 'home'|'varieties'|'story'|'export'|'contact', lang: Locale): string`; `getVarietyPath(slug: string, lang: Locale): string`.
- Consumed by: Tasks 7, 9–14 (Header, Footer, every page/content component).

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node' },
});
```

- [ ] **Step 2: Write the failing test** — `tests/i18n.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { getLangFromUrl, getLocalizedPath, getVarietyPath } from '../src/i18n/utils';

describe('getLangFromUrl', () => {
  it('detects English from the /en/ prefix', () => {
    expect(getLangFromUrl(new URL('https://duriansriraja.com/en/varieties/'))).toBe('en');
  });

  it('defaults to Indonesian for non-/en/ paths', () => {
    expect(getLangFromUrl(new URL('https://duriansriraja.com/varietas/'))).toBe('id');
  });
});

describe('getLocalizedPath', () => {
  it('maps each route key to its locale-specific path', () => {
    expect(getLocalizedPath('home', 'id')).toBe('/');
    expect(getLocalizedPath('home', 'en')).toBe('/en/');
    expect(getLocalizedPath('varieties', 'id')).toBe('/varietas/');
    expect(getLocalizedPath('varieties', 'en')).toBe('/en/varieties/');
    expect(getLocalizedPath('story', 'id')).toBe('/cerita-kami/');
    expect(getLocalizedPath('story', 'en')).toBe('/en/our-story/');
    expect(getLocalizedPath('export', 'id')).toBe('/ekspor/');
    expect(getLocalizedPath('export', 'en')).toBe('/en/export/');
    expect(getLocalizedPath('contact', 'id')).toBe('/kontak/');
    expect(getLocalizedPath('contact', 'en')).toBe('/en/contact/');
  });
});

describe('getVarietyPath', () => {
  it('builds locale-specific variety detail URLs', () => {
    expect(getVarietyPath('musang-king', 'id')).toBe('/varietas/musang-king/');
    expect(getVarietyPath('musang-king', 'en')).toBe('/en/varieties/musang-king/');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/i18n.test.ts`
Expected: FAIL — `Cannot find module '../src/i18n/utils'`.

- [ ] **Step 4: Write `src/i18n/ui.ts`**

```ts
export type Locale = 'id' | 'en';

export const languages = { id: 'ID', en: 'EN' } as const;

export const ui = {
  id: {
    nav: {
      home: 'Beranda',
      varieties: 'Varietas',
      story: 'Cerita Kami',
      export: 'Ekspor',
      contact: 'Kontak',
    },
    whatsapp: {
      generic: 'Halo, saya tertarik dengan durian dari Kebun Sriraja',
      variety: (name: string) => `Halo, saya tertarik dengan ${name}`,
      partnership: 'Halo, saya ingin menjajaki kemitraan/ekspor dengan Kebun Sriraja',
    },
    footer: {
      blurb:
        'Durian premium dari kebun keluarga di Bukit Lawang, Sumatera Utara. Ditanam dengan sabar, dipanen langsung dari pohon.',
      rights: 'Hak cipta dilindungi.',
      navigate: 'Navigasi',
      language: 'Bahasa',
    },
    ctaOrder: 'Pesan via WhatsApp',
    ctaBrowse: 'Lihat Jenis Durian',
  },
  en: {
    nav: {
      home: 'Home',
      varieties: 'Varieties',
      story: 'Our Story',
      export: 'Export',
      contact: 'Contact',
    },
    whatsapp: {
      generic: "Hi, I'm interested in durian from Sriraja Farm",
      variety: (name: string) => `Hi, I'm interested in ${name}`,
      partnership: "Hi, I'd like to discuss an export/partnership opportunity with Sriraja Farm",
    },
    footer: {
      blurb:
        'Premium durian from a family orchard in Bukit Lawang, North Sumatra. Grown with patience, harvested straight from the tree.',
      rights: 'All rights reserved.',
      navigate: 'Navigate',
      language: 'Language',
    },
    ctaOrder: 'Order via WhatsApp',
    ctaBrowse: 'View Varieties',
  },
} as const;
```

- [ ] **Step 5: Write `src/i18n/utils.ts`**

```ts
import { ui, type Locale } from './ui';

export type { Locale };

export function getLangFromUrl(url: URL): Locale {
  return url.pathname.startsWith('/en/') || url.pathname === '/en' ? 'en' : 'id';
}

export function useTranslations(lang: Locale) {
  return ui[lang];
}

type RouteKey = 'home' | 'varieties' | 'story' | 'export' | 'contact';

const routes: Record<RouteKey, Record<Locale, string>> = {
  home: { id: '/', en: '/en/' },
  varieties: { id: '/varietas/', en: '/en/varieties/' },
  story: { id: '/cerita-kami/', en: '/en/our-story/' },
  export: { id: '/ekspor/', en: '/en/export/' },
  contact: { id: '/kontak/', en: '/en/contact/' },
};

export function getLocalizedPath(routeKey: RouteKey, lang: Locale): string {
  return routes[routeKey][lang];
}

export function getVarietyPath(slug: string, lang: Locale): string {
  return lang === 'id' ? `/varietas/${slug}/` : `/en/varieties/${slug}/`;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run tests/i18n.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Add the i18n block to `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duriansriraja.com',
  output: 'static',
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 8: Verify the project still builds**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 9: Commit**

```bash
git add src/i18n vitest.config.ts tests/i18n.test.ts astro.config.mjs
git commit -m "Add i18n routing config, ui dictionary, and locale-path helpers"
```

---

## Task 3: WhatsApp config & `waLink` helper

**Files:**
- Create: `src/config.ts`
- Test: `tests/config.test.ts`

**Interfaces:**
- Produces: `WHATSAPP_NUMBER: string`; `waLink(message: string): string`.
- Consumed by: `WhatsAppButton.astro` (Task 9).

- [ ] **Step 1: Write the failing test** — `tests/config.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { waLink, WHATSAPP_NUMBER } from '../src/config';

describe('waLink', () => {
  it('builds a wa.me URL with the configured number', () => {
    expect(waLink('hello')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=hello`);
  });

  it('URL-encodes commas, spaces, and punctuation', () => {
    const url = waLink('Halo, saya tertarik dengan Musang King');
    expect(url).toBe(
      `https://wa.me/${WHATSAPP_NUMBER}?text=Halo%2C%20saya%20tertarik%20dengan%20Musang%20King`
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/config.test.ts`
Expected: FAIL — `Cannot find module '../src/config'`.

- [ ] **Step 3: Write `src/config.ts`**

```ts
export const WHATSAPP_NUMBER = '6283194111119';

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/config.ts tests/config.test.ts
git commit -m "Add WhatsApp config and waLink helper"
```

---

## Task 4: Content collections — `varieties` schema + seed data

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/utils.ts`
- Create: `src/content/varieties/id/musang-king.md`, `black-thorn.md`, `monthong.md`, `sultan.md`, `chanee.md`
- Create: `src/content/varieties/en/musang-king.md`, `black-thorn.md`, `monthong.md`, `sultan.md`, `chanee.md`

**Interfaces:**
- Produces: `varieties` collection with schema `{ name, tagline, flavorProfile: {sweetness,bitterness,creaminess} (1-5 int), season, grade, origin, priceNote, images: {src,alt}[], featured, order }`; `getVarietiesForLocale(locale: Locale): Promise<CollectionEntry<'varieties'>[]>` (sorted by `order`); `slugFromId(id: string): string`.
- Consumed by: Tasks 9–11 (Home, Varieties listing, Variety detail).

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const varieties = defineCollection({
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
});

export const collections = { varieties };
```

- [ ] **Step 2: Run `astro sync` to verify it succeeds with zero entries**

Run: `npx astro sync`
Expected: exits 0 (no entries yet, nothing to validate against the schema).

- [ ] **Step 3: Write `src/content/utils.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/utils';

export async function getVarietiesForLocale(
  locale: Locale
): Promise<CollectionEntry<'varieties'>[]> {
  const all = await getCollection('varieties');
  return all
    .filter((entry) => entry.id.startsWith(`${locale}/`))
    .sort((a, b) => a.data.order - b.data.order);
}

export function slugFromId(id: string): string {
  return id.split('/')[1];
}
```

- [ ] **Step 4: Write the 5 Indonesian variety files**

`src/content/varieties/id/musang-king.md`:

```markdown
---
name: "Musang King"
tagline: "Sang raja durian — legit, manis, dengan sentuhan pahit yang khas"
flavorProfile: { sweetness: 4, bitterness: 4, creaminess: 5 }
season: "Pertengahan & akhir tahun"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Harga pasar — hubungi via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Durian Musang King belah" }]
featured: true
order: 1
---
Musang King adalah varietas paling dicari di dunia — dagingnya tebal, berwarna
kuning keemasan, dengan tekstur yang sangat legit dan perpaduan rasa manis-pahit
yang seimbang. Inilah durian yang membuat orang jatuh cinta pada durian.
```

`src/content/varieties/id/black-thorn.md`:

```markdown
---
name: "Black Thorn"
tagline: "Sangat manis, lembut meleleh, aroma yang mewah"
flavorProfile: { sweetness: 5, bitterness: 3, creaminess: 5 }
season: "Pertengahan & akhir tahun"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Harga pasar — hubungi via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Durian Black Thorn" }]
featured: true
order: 2
---
Black Thorn dikenal dengan dagingnya yang sangat lembut dan meleleh di mulut,
dengan rasa manis yang kaya dan sedikit pahit. Salah satu varietas premium paling
bergengsi.
```

`src/content/varieties/id/monthong.md`:

```markdown
---
name: "Monthong"
tagline: "Daging tebal, manis lembut, cocok untuk pemula"
flavorProfile: { sweetness: 4, bitterness: 1, creaminess: 3 }
season: "Pertengahan & akhir tahun"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Harga pasar — hubungi via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Durian Monthong" }]
featured: false
order: 3
---
Monthong memiliki daging yang tebal dan padat dengan rasa manis lembut serta
aroma yang tidak terlalu tajam — pilihan sempurna bagi yang baru mengenal durian
premium.
```

`src/content/varieties/id/sultan.md`:

```markdown
---
name: "Sultan"
tagline: "Seimbang manis dan pahit, legit dengan sentuhan khas"
flavorProfile: { sweetness: 3, bitterness: 4, creaminess: 4 }
season: "Pertengahan & akhir tahun"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Harga pasar — hubungi via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Durian Sultan" }]
featured: false
order: 4
---
Sultan menawarkan keseimbangan sempurna antara manis dan pahit dengan tekstur
yang legit. Favorit para pecinta durian sejati.
```

`src/content/varieties/id/chanee.md`:

```markdown
---
name: "Chanee"
tagline: "Manis lembut dengan aroma kuat, daging tebal keemasan"
flavorProfile: { sweetness: 4, bitterness: 2, creaminess: 4 }
season: "Pertengahan & akhir tahun"
grade: "Premium"
origin: "Kebun Durian Sriraja, Bukit Lawang, Sumatera Utara"
priceNote: "Harga pasar — hubungi via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Durian Chanee belah" }]
featured: false
order: 5
---
Chanee adalah varietas Thailand yang populer, dikenal dengan daging tebal
berwarna kuning keemasan, tekstur lembut, dan rasa manis dengan aroma yang kuat.
Pilihan yang memuaskan bagi pencinta durian yang menyukai rasa manis penuh.
```

- [ ] **Step 5: Write the 5 English variety files**

`src/content/varieties/en/musang-king.md`:

```markdown
---
name: "Musang King"
tagline: "The king of durians — creamy, sweet, with a signature bitter edge"
flavorProfile: { sweetness: 4, bitterness: 4, creaminess: 5 }
season: "Mid-year & year-end"
grade: "Premium"
origin: "Durian Sriraja Farm, Bukit Lawang, North Sumatra"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Musang King durian, opened" }]
featured: true
order: 1
---
Musang King is the most sought-after variety in the world — thick, golden-yellow
flesh with an intensely creamy texture and a balanced sweet-bitter flavor. This
is the durian that makes people fall in love with durian.
```

`src/content/varieties/en/black-thorn.md`:

```markdown
---
name: "Black Thorn"
tagline: "Intensely sweet, melt-in-the-mouth, luxuriously aromatic"
flavorProfile: { sweetness: 5, bitterness: 3, creaminess: 5 }
season: "Mid-year & year-end"
grade: "Premium"
origin: "Durian Sriraja Farm, Bukit Lawang, North Sumatra"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Black Thorn durian" }]
featured: true
order: 2
---
Black Thorn is prized for its exceptionally soft, melting flesh, rich sweetness,
and a gentle bitter finish. One of the most prestigious premium varieties.
```

`src/content/varieties/en/monthong.md`:

```markdown
---
name: "Monthong"
tagline: "Thick flesh, gently sweet, perfect for beginners"
flavorProfile: { sweetness: 4, bitterness: 1, creaminess: 3 }
season: "Mid-year & year-end"
grade: "Premium"
origin: "Durian Sriraja Farm, Bukit Lawang, North Sumatra"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Monthong durian" }]
featured: false
order: 3
---
Monthong has thick, firm flesh with a mild sweetness and a less pungent aroma —
the perfect choice for anyone new to premium durian.
```

`src/content/varieties/en/sultan.md`:

```markdown
---
name: "Sultan"
tagline: "Balanced sweet and bitter, creamy with a distinctive finish"
flavorProfile: { sweetness: 3, bitterness: 4, creaminess: 4 }
season: "Mid-year & year-end"
grade: "Premium"
origin: "Durian Sriraja Farm, Bukit Lawang, North Sumatra"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Sultan durian" }]
featured: false
order: 4
---
Sultan offers a perfect balance of sweet and bitter with a creamy texture. A
favorite among serious durian lovers.
```

`src/content/varieties/en/chanee.md`:

```markdown
---
name: "Chanee"
tagline: "Smooth and sweet with a bold aroma, thick golden flesh"
flavorProfile: { sweetness: 4, bitterness: 2, creaminess: 4 }
season: "Mid-year & year-end"
grade: "Premium"
origin: "Durian Sriraja Farm, Bukit Lawang, North Sumatra"
priceNote: "Market price — contact via WhatsApp"
images: [{ src: "/images/placeholder-durian.jpg", alt: "Chanee durian, opened" }]
featured: false
order: 5
---
Chanee is a popular Thai variety known for its thick, golden-yellow flesh, smooth
texture, and sweet flavor with a bold aroma. A satisfying choice for durian
lovers who enjoy full, rich sweetness.
```

- [ ] **Step 6: Run `astro sync` to verify all 10 entries validate against the schema**

Run: `npx astro sync`
Expected: exits 0 with no Zod validation errors.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content
git commit -m "Add varieties content collection with 5 seeded durian varieties"
```

---

## Task 5: Placeholder images

**Files:**
- Create: `public/images/placeholder-durian.jpg`
- Create: `public/images/placeholder-farm.jpg`
- Create: `public/images/placeholder-orchard.jpg`

**Interfaces:**
- Produces: 3 real JPG files at fixed public paths, referenced by the variety markdown (Task 4) and the Home/Story sections (Task 9, 12).

- [ ] **Step 1: Generate the durian placeholder (4:3) with ImageMagick**

Run:
```bash
mkdir -p public/images
magick -size 1600x1200 xc:'#F1EADA' \
  -fill '#E8E0CE' -draw 'rectangle 0,0 1600,1200' \
  -gravity center -font "/System/Library/Fonts/Supplemental/Andale Mono.ttf" -pointsize 44 -fill '#8A8372' \
  -annotate +0-30 'PLACEHOLDER PHOTO' \
  -pointsize 28 -annotate +0+40 'Durian Sriraja — replace with a real photo' \
  public/images/placeholder-durian.jpg
```
Expected: exits 0, creates the file.

- [ ] **Step 2: Generate the farm hero placeholder (16:10)**

Run:
```bash
magick -size 1920x1200 xc:'#1C3327' \
  -fill '#203A2C' -draw 'rectangle 0,0 1920,1200' \
  -gravity center -font "/System/Library/Fonts/Supplemental/Andale Mono.ttf" -pointsize 44 -fill '#E3C07A' \
  -annotate +0-30 'PLACEHOLDER PHOTO' \
  -pointsize 28 -annotate +0+40 'Bukit Lawang orchard — replace with a real photo' \
  public/images/placeholder-farm.jpg
```
Expected: exits 0, creates the file.

- [ ] **Step 3: Generate the orchard placeholder (5:4)**

Run:
```bash
magick -size 1600x1280 xc:'#E8E0CE' \
  -fill '#F1EADA' -draw 'rectangle 0,0 1600,1280' \
  -gravity center -font "/System/Library/Fonts/Supplemental/Andale Mono.ttf" -pointsize 44 -fill '#8A8372' \
  -annotate +0-30 'PLACEHOLDER PHOTO' \
  -pointsize 28 -annotate +0+40 'Family orchard — replace with a real photo' \
  public/images/placeholder-orchard.jpg
```
Expected: exits 0, creates the file.

- [ ] **Step 4: Verify all three files are valid JPEGs**

Run: `identify public/images/placeholder-durian.jpg public/images/placeholder-farm.jpg public/images/placeholder-orchard.jpg`
Expected: prints three lines, each starting with the filename and `JPEG`.

- [ ] **Step 5: Commit**

```bash
git add public/images
git commit -m "Add generated placeholder images for durian, farm, and orchard photos"
```

---

## Task 6: Design tokens & global styles

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: Tailwind v4 theme tokens (`--color-cream`, `--color-charcoal`, `--color-forest`, `--color-forest-dark`, `--color-forest-deep`, `--color-gold`, `--color-gold-light`, `--color-gold-muted`, `--color-gold-border`, `--color-card`, `--color-muted`, `--color-muted-dark`, `--color-muted-deep`, `--color-muted-light`, `--font-serif`, `--font-sans`), imported once by `BaseLayout.astro` (Task 7).

- [ ] **Step 1: Write `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource/prata";
@import "@fontsource/karla";

@theme {
  --color-cream: #F7F2E7;
  --color-charcoal: #1F1E1B;
  --color-forest: #1C3327;
  --color-forest-dark: #14251C;
  --color-forest-deep: #0B1611;
  --color-gold: #C8963E;
  --color-gold-light: #E3C07A;
  --color-gold-muted: #8A6A24;
  --color-gold-border: #A8842F;
  --color-card: #FFFCF5;
  --color-muted: #5C5949;
  --color-muted-dark: #4A4839;
  --color-muted-deep: #3D3B2F;
  --color-muted-light: #8A8372;
  --font-serif: "Prata", serif;
  --font-sans: "Karla", system-ui, sans-serif;
}

body {
  background: var(--color-cream);
  color: var(--color-charcoal);
  font-family: var(--font-sans);
}

h1, h2, h3 {
  font-family: var(--font-serif);
  font-weight: 400;
}

a {
  color: var(--color-gold-muted);
}
a:hover {
  color: var(--color-forest);
}

::selection {
  background: var(--color-gold-light);
  color: var(--color-forest-dark);
}

:focus-visible {
  outline: 2px solid var(--color-gold-border);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Temporarily wire it into the placeholder page to force Tailwind to process it**

Modify `src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<html>
  <head><title>Durian Sriraja</title></head>
  <body class="bg-cream text-charcoal">
    <h1 class="font-serif text-forest">Coming soon</h1>
  </body>
</html>
```

- [ ] **Step 3: Build and verify the theme tokens and fonts are emitted**

Run: `npm run build && grep -r "color-forest" dist/_astro/*.css`
Expected: at least one match containing `--color-forest:#1c3327` (Tailwind may normalize hex casing/spacing).

Run: `grep -l "Prata" dist/_astro/*.css`
Expected: a CSS file is listed (Fontsource's `@font-face` rule for Prata was bundled).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "Add Tailwind v4 design tokens and self-hosted fonts"
```

---

## Task 7: SEO shell — `BaseHead`, `Header`, `Footer`, `BaseLayout`

**Files:**
- Create: `src/components/BaseHead.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `useTranslations`, `getLocalizedPath`, `type Locale` (Task 2).
- Produces: `<BaseLayout title description lang alternatePath ogImage? jsonLd?>` — the wrapper every page (Tasks 9–15) uses. `alternatePath` is the full path of the *same page* in the other locale; every page computes and passes it explicitly (there's no automatic locale-path rewriting, since routes like `/varietas/` vs `/en/varieties/` aren't a simple prefix swap).

- [ ] **Step 1: Write `src/components/BaseHead.astro`**

```astro
---
interface Props {
  title: string;
  description: string;
  lang: 'id' | 'en';
  alternatePath: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
}
const { title, description, lang, alternatePath, ogImage, jsonLd = [] } = Astro.props;

const siteUrl = Astro.site ?? new URL('https://duriansriraja.com');
const selfURL = new URL(Astro.url.pathname, siteUrl);
const otherURL = new URL(alternatePath, siteUrl);
const idURL = lang === 'id' ? selfURL : otherURL;
const enURL = lang === 'en' ? selfURL : otherURL;

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  name: 'Durian Sriraja',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bukit Lawang',
    addressRegion: 'Kabupaten Langkat, Sumatera Utara',
    addressCountry: 'ID',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 3.5556, longitude: 98.1197 },
  areaServed: 'Indonesia',
  telephone: '+6283194111119',
  url: siteUrl.toString(),
};
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={selfURL} />
<link rel="alternate" hreflang="id" href={idURL} />
<link rel="alternate" hreflang="en" href={enURL} />
<link rel="alternate" hreflang="x-default" href={idURL} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:locale" content={lang === 'id' ? 'id_ID' : 'en_US'} />
<meta property="og:url" content={selfURL} />
{ogImage && <meta property="og:image" content={new URL(ogImage, siteUrl)} />}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{ogImage && <meta name="twitter:image" content={new URL(ogImage, siteUrl)} />}
<script type="application/ld+json" set:html={JSON.stringify(localBusinessJsonLd)} />
{jsonLd.map((item) => <script type="application/ld+json" set:html={JSON.stringify(item)} />)}
```

- [ ] **Step 2: Write `src/components/Header.astro`**

```astro
---
import { useTranslations, getLocalizedPath } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale; alternatePath: string }
const { lang, alternatePath } = Astro.props;
const t = useTranslations(lang);

const navItems = [
  { key: 'home' as const, label: t.nav.home },
  { key: 'varieties' as const, label: t.nav.varieties },
  { key: 'story' as const, label: t.nav.story },
  { key: 'export' as const, label: t.nav.export },
  { key: 'contact' as const, label: t.nav.contact },
];

const currentPath = Astro.url.pathname;
const idHref = lang === 'id' ? currentPath : alternatePath;
const enHref = lang === 'en' ? currentPath : alternatePath;
---
<header class="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-gold/25">
  <div class="mx-auto max-w-6xl flex items-center gap-5 px-5 py-3.5 flex-wrap">
    <a href={getLocalizedPath('home', lang)} class="flex items-center gap-3 mr-auto">
      <span class="block h-7 w-7 border border-gold-muted rounded-tr-full rounded-bl-full"></span>
      <span class="flex flex-col leading-none">
        <span class="font-serif text-lg text-forest">Durian Sriraja</span>
        <span class="text-[9px] tracking-[0.28em] uppercase text-gold-muted mt-1">Bukit Lawang · North Sumatra</span>
      </span>
    </a>
    <nav class="flex gap-6 flex-wrap items-center">
      {navItems.map((item) => {
        const href = getLocalizedPath(item.key, lang);
        const active = currentPath === href;
        return (
          <a
            href={href}
            class:list={[
              'text-sm uppercase tracking-wide border-b pb-0.5',
              active ? 'text-forest border-gold-border' : 'text-muted border-transparent hover:text-forest',
            ]}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
    <div class="flex items-center border border-gold-muted/40 rounded-full overflow-hidden text-xs tracking-wide">
      <a href={idHref} class:list={['px-3 py-1.5', lang === 'id' ? 'bg-forest text-gold-light' : 'text-muted']}>ID</a>
      <a href={enHref} class:list={['px-3 py-1.5', lang === 'en' ? 'bg-forest text-gold-light' : 'text-muted']}>EN</a>
    </div>
  </div>
</header>
```

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
---
import { useTranslations, getLocalizedPath } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale; alternatePath: string }
const { lang, alternatePath } = Astro.props;
const t = useTranslations(lang);
const currentPath = Astro.url.pathname;

const navItems = [
  { key: 'home' as const, label: t.nav.home },
  { key: 'varieties' as const, label: t.nav.varieties },
  { key: 'story' as const, label: t.nav.story },
  { key: 'export' as const, label: t.nav.export },
  { key: 'contact' as const, label: t.nav.contact },
];
const year = new Date().getFullYear();
---
<footer class="bg-forest-dark text-cream/80">
  <div class="mx-auto max-w-6xl grid gap-9 px-5 py-14" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
    <div>
      <div class="flex items-center gap-3">
        <span class="block h-6 w-6 border border-gold-muted rounded-tr-full rounded-bl-full"></span>
        <span class="font-serif text-lg text-cream">Durian Sriraja</span>
      </div>
      <p class="text-sm leading-relaxed mt-4 max-w-xs">{t.footer.blurb}</p>
    </div>
    <div>
      <h4 class="text-[11px] tracking-[0.22em] uppercase text-gold-light mb-4">{t.footer.navigate}</h4>
      <div class="flex flex-col gap-2">
        {navItems.map((item) => (
          <a href={getLocalizedPath(item.key, lang)} class="text-sm hover:text-gold-light">{item.label}</a>
        ))}
      </div>
    </div>
    <div>
      <h4 class="text-[11px] tracking-[0.22em] uppercase text-gold-light mb-4">{t.footer.language}</h4>
      <div class="inline-flex items-center border border-gold/45 rounded-full overflow-hidden text-xs">
        <a href={lang === 'id' ? currentPath : alternatePath} class:list={['px-3 py-1.5', lang === 'id' ? 'bg-gold text-forest-dark' : 'text-cream/70']}>ID</a>
        <a href={lang === 'en' ? currentPath : alternatePath} class:list={['px-3 py-1.5', lang === 'en' ? 'bg-gold text-forest-dark' : 'text-cream/70']}>EN</a>
      </div>
    </div>
  </div>
  <div class="mx-auto max-w-6xl px-5 py-5 border-t border-gold/20 flex flex-wrap justify-between gap-3 text-xs text-cream/55">
    <span>&copy; {year} Durian Sriraja. {t.footer.rights}</span>
  </div>
</footer>
```

- [ ] **Step 4: Write `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  lang: 'id' | 'en';
  alternatePath: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
}
const { title, description, lang, alternatePath, ogImage, jsonLd } = Astro.props;
---
<!doctype html>
<html lang={lang}>
  <head>
    <BaseHead title={title} description={description} lang={lang} alternatePath={alternatePath} ogImage={ogImage} jsonLd={jsonLd} />
  </head>
  <body>
    <Header lang={lang} alternatePath={alternatePath} />
    <main>
      <slot />
    </main>
    <Footer lang={lang} alternatePath={alternatePath} />
  </body>
</html>
```

- [ ] **Step 5: Wire the placeholder page through `BaseLayout` to test the whole shell**

Modify `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Durian Sriraja" description="Coming soon." lang="id" alternatePath="/en/">
  <h1 class="font-serif text-forest text-center py-24">Coming soon</h1>
</BaseLayout>
```

- [ ] **Step 6: Build and verify SEO output**

Run: `npm run build`

Run: `grep -o '<title>[^<]*</title>' dist/index.html`
Expected: `<title>Durian Sriraja</title>`

Run: `grep -c 'hreflang' dist/index.html`
Expected: `3` (id, en, x-default).

Run: `grep -o 'FoodEstablishment' dist/index.html`
Expected: at least one match.

Run: `grep -o 'Beranda' dist/index.html`
Expected: at least one match (nav label rendered).

Run: `grep -o 'Ditanam dengan sabar' dist/index.html`
Expected: at least one match (footer blurb rendered).

- [ ] **Step 7: Commit**

```bash
git add src/components/BaseHead.astro src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "Add SEO shell: BaseHead, Header, Footer, BaseLayout"
```

---

## Task 8: Page meta table — `src/i18n/meta.ts`

**Files:**
- Create: `src/i18n/meta.ts`

**Interfaces:**
- Produces: `meta: Record<Locale, Record<'home'|'varieties'|'story'|'international'|'contact', {title, description}>>`; `varietyMeta(lang: Locale, data: {name, tagline, origin}): {title, description}`.
- Consumed by: Tasks 9–14 (every static page + variety detail).

- [ ] **Step 1: Write `src/i18n/meta.ts`**

```ts
import type { Locale } from './utils';

export const meta = {
  id: {
    home: {
      title: 'Durian Sriraja — Durian Premium Bukit Lawang, Sumatera Utara',
      description:
        'Durian premium langsung dari kebun keluarga di Bukit Lawang. Musang King, Black Thorn, Monthong — segar dari pohon. Pesan via WhatsApp.',
    },
    varieties: {
      title: 'Jenis Durian Premium Kami | Durian Sriraja Bukit Lawang',
      description:
        'Lihat jenis durian premium dari kebun kami di Bukit Lawang: Musang King, Black Thorn, Monthong, Sultan, dan Chanee. Segar dari kebun.',
    },
    story: {
      title: 'Cerita Kami — Kebun Durian di Rimba Bukit Lawang',
      description:
        'Dari tempat retret mindfulness ke kebun durian 8 hektar di Bukit Lawang. Kisah keluarga Durian Sriraja menanam durian premium sejak 2021.',
    },
    international: {
      title: 'Pembeli Internasional — Durian Premium Indonesia | Sriraja',
      description:
        'Pembeli dan mitra luar negeri: kunjungi kebun kami di Bukit Lawang, cicipi langsung, atau diskusikan kemitraan durian premium jangka panjang.',
    },
    contact: {
      title: 'Kontak & Kunjungan Kebun | Durian Sriraja Bukit Lawang',
      description:
        'Hubungi Durian Sriraja via WhatsApp untuk pesan durian premium atau atur kunjungan ke kebun kami di Bukit Lawang, Langkat, Sumatera Utara.',
    },
  },
  en: {
    home: {
      title: 'Durian Sriraja — Premium Durian Farm in Bukit Lawang',
      description:
        'Premium durian straight from our family farm in the Bukit Lawang rainforest, North Sumatra. Musang King, Black Thorn & more. Order via WhatsApp.',
    },
    varieties: {
      title: 'Our Premium Durian Varieties | Durian Sriraja',
      description:
        'Explore the premium durian we grow in Bukit Lawang: Musang King, Black Thorn, Monthong, Sultan, and Chanee. Fresh from our family farm.',
    },
    story: {
      title: 'Our Story — A Durian Orchard in the Bukit Lawang Jungle',
      description:
        'From a mindfulness retreat to an 8-hectare durian orchard in Bukit Lawang. The family story of Durian Sriraja, growing premium durian since 2021.',
    },
    international: {
      title: 'For International Buyers | Durian Sriraja, North Sumatra',
      description:
        'Overseas buyers & partners: visit our Bukit Lawang farm, taste our premium durian, or discuss long-term supply from North Sumatra, Indonesia.',
    },
    contact: {
      title: 'Contact & Farm Visits | Durian Sriraja Bukit Lawang',
      description:
        'Contact Durian Sriraja on WhatsApp to order premium durian or arrange a visit to our farm in Bukit Lawang, Langkat, North Sumatra.',
    },
  },
} as const;

export function varietyMeta(lang: Locale, data: { name: string; tagline: string; origin: string }) {
  const title =
    lang === 'id'
      ? `${data.name} — Durian Premium Bukit Lawang | Durian Sriraja`
      : `${data.name} Durian — Premium from Bukit Lawang | Durian Sriraja`;
  return { title, description: `${data.tagline} — ${data.origin}` };
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: no errors referencing `src/i18n/meta.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/meta.ts
git commit -m "Add per-page SEO meta table and variety detail meta generator"
```

---

## Task 9: Home page (id + en)

**Files:**
- Create: `src/components/WhatsAppButton.astro`
- Create: `src/components/VarietyCard.astro`
- Create: `src/components/HomeContent.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `waLink` (Task 3), `getVarietiesForLocale`, `slugFromId` (Task 4), `useTranslations`, `getLocalizedPath`, `getVarietyPath` (Task 2), `meta` (Task 8), `BaseLayout` (Task 7).
- Produces: `<WhatsAppButton message label variant?>`, `<VarietyCard entry slug lang viewLabel>` — reused by Tasks 10 (Varieties listing).

- [ ] **Step 1: Write `src/components/WhatsAppButton.astro`**

```astro
---
import { waLink } from '../config';

interface Props {
  message: string;
  label: string;
  variant?: 'primary' | 'outline';
}
const { message, label, variant = 'primary' } = Astro.props;
const href = waLink(message);
const base = 'inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold';
const styles =
  variant === 'primary'
    ? 'bg-gold text-forest-dark shadow-lg hover:bg-gold-light'
    : 'border border-cream/45 text-cream hover:border-gold-light';
---
<a href={href} class:list={[base, styles]} target="_blank" rel="noopener noreferrer">
  {variant === 'primary' && <span class="block h-2 w-2 rounded-full bg-forest-dark"></span>}
  {label}
</a>
```

- [ ] **Step 2: Write `src/components/VarietyCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { getVarietyPath } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props {
  entry: CollectionEntry<'varieties'>;
  slug: string;
  lang: Locale;
  viewLabel: string;
}
const { entry, slug, lang, viewLabel } = Astro.props;
const { name, tagline, grade, season, images } = entry.data;
const image = images[0];
---
<a href={getVarietyPath(slug, lang)} class="block rounded-2xl overflow-hidden bg-card border border-gold/20 hover:shadow-xl transition-shadow">
  <div class="relative aspect-[4/3]">
    <img src={image?.src ?? '/images/placeholder-durian.jpg'} alt={image?.alt ?? name} loading="lazy" decoding="async" class="h-full w-full object-cover" />
    <span class="absolute top-3 right-3 rounded-full bg-forest/90 text-gold-light text-[10px] tracking-wider uppercase px-3 py-1.5">{grade}</span>
  </div>
  <div class="p-5">
    <h3 class="font-serif text-xl text-forest">{name}</h3>
    <p class="text-sm leading-relaxed text-muted mt-2">{tagline}</p>
    <div class="flex justify-between items-center border-t border-gold/20 pt-3 mt-4 text-xs uppercase tracking-wide text-gold-muted">
      <span>{season}</span>
      <span class="text-forest normal-case text-[13px]">{viewLabel} →</span>
    </div>
  </div>
</a>
```

- [ ] **Step 3: Write `src/components/HomeContent.astro`**

```astro
---
import WhatsAppButton from './WhatsAppButton.astro';
import VarietyCard from './VarietyCard.astro';
import { useTranslations, getLocalizedPath } from '../i18n/utils';
import { getVarietiesForLocale, slugFromId } from '../content/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale }
const { lang } = Astro.props;
const t = useTranslations(lang);

const varieties = await getVarietiesForLocale(lang);
const featured = varieties.filter((v) => v.data.featured);

const copy = {
  id: {
    heroTitle: 'Raja Durian dari Rimba Bukit Lawang',
    heroBody:
      'Durian premium langsung dari kebun keluarga kami, tumbuh di jantung hutan Bukit Lawang, Sumatera Utara. Musang King, Black Thorn, Monthong, dan lainnya — segar dari pohon.',
    promises: [
      '🌳 Langsung dari Kebun — tanpa perantara, panen sendiri',
      '🌧️ Ditanam di Bukit Lawang — tanah subur di tepi Taman Nasional Gunung Leuser',
      '👨‍👩‍👦 Kebun Keluarga — dikelola langsung oleh keluarga kami',
    ],
    whyTitle: 'Kenapa Durian Sriraja?',
    whyBody1:
      'Kami bukan penjual durian biasa. Kebun kami tumbuh di dalam rimba Bukit Lawang — salah satu hutan hujan tertua di dunia. Setiap buah dipanen dari pohon kami sendiri dan dikirim segar, bukan lewat rantai distributor yang panjang.',
    whyBody2:
      'Saat musim panen, durian tersedia segar dan dikemas rapi. Di luar musim, kami sediakan durian beku berkualitas agar Anda tetap bisa menikmatinya kapan saja.',
    storyTitle: 'Dari Retret ke Kebun Durian',
    storyBody:
      'Keluarga kami menjalankan tempat retret mindfulness di Bukit Lawang. Kebun durian ini lahir dari kecintaan yang sama terhadap alam dan kesabaran — menanam pohon hari ini untuk buah bertahun-tahun ke depan.',
    storyLink: 'Baca Cerita Kami',
    intlTitle: 'Pembeli dari Luar Negeri?',
    intlBody:
      'Kami menyambut pembeli dan mitra internasional. Kunjungi kebun, cicipi langsung, atau diskusikan kemitraan jangka panjang.',
    intlLink: 'Pelajari Lebih Lanjut',
    featuredKicker: 'Kebun Kami',
    featuredTitle: 'Varietas Unggulan',
    viewLabel: 'Lihat',
    finalCta: 'Mau pesan durian premium langsung dari kebun?',
  },
  en: {
    heroTitle: 'The King of Durians, from the Bukit Lawang Rainforest',
    heroBody:
      'Premium durian straight from our family farm, grown in the heart of the Bukit Lawang jungle in North Sumatra. Musang King, Black Thorn, Monthong, and more — fresh from the tree.',
    promises: [
      '🌳 Farm-Direct — no middlemen, harvested by us',
      '🌧️ Grown in Bukit Lawang — fertile land beside Gunung Leuser National Park',
      '👨‍👩‍👦 Family-Run — managed directly by our family',
    ],
    whyTitle: 'Why Durian Sriraja?',
    whyBody1:
      "We're not an ordinary durian seller. Our orchard grows inside the Bukit Lawang rainforest — one of the oldest jungles on earth. Every fruit is harvested from our own trees and delivered fresh, not passed through a long distributor chain.",
    whyBody2:
      'In season, durian is available fresh and carefully boxed. Off-season, we offer quality frozen durian so you can enjoy it any time of year.',
    storyTitle: 'From a Retreat to a Durian Orchard',
    storyBody:
      'Our family runs a mindfulness retreat in Bukit Lawang. This durian orchard grew from the same love of nature and patience — planting trees today for fruit years into the future.',
    storyLink: 'Read Our Story',
    intlTitle: 'Buying from Overseas?',
    intlBody:
      'We welcome international buyers and partners. Visit the farm, taste it yourself, or discuss a long-term partnership.',
    intlLink: 'Learn More',
    featuredKicker: 'Our Orchard',
    featuredTitle: 'Featured Varieties',
    viewLabel: 'View',
    finalCta: 'Want premium durian straight from the farm?',
  },
} as const;

const c = copy[lang];
---
<section class="relative min-h-[70vh] flex items-end bg-forest">
  <img src="/images/placeholder-farm.jpg" alt="" class="absolute inset-0 h-full w-full object-cover opacity-50" />
  <div class="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/40 to-transparent"></div>
  <div class="relative mx-auto max-w-6xl w-full px-5 py-16">
    <h1 class="font-serif text-cream text-4xl md:text-7xl leading-tight max-w-2xl">{c.heroTitle}</h1>
    <p class="text-cream/85 mt-6 max-w-xl leading-relaxed">{c.heroBody}</p>
    <div class="flex flex-wrap gap-4 mt-8">
      <WhatsAppButton message={t.whatsapp.generic} label={t.ctaOrder} />
      <a href={getLocalizedPath('varieties', lang)} class="inline-flex items-center gap-2 border border-cream/45 text-cream rounded-full px-6 py-3.5 text-sm hover:border-gold-light">{t.ctaBrowse}</a>
    </div>
  </div>
</section>

<section class="bg-forest text-cream/90 border-t border-gold/30">
  <div class="mx-auto max-w-6xl px-5 py-6 grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    {c.promises.map((p) => <p class="text-sm">{p}</p>)}
  </div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 md:py-24">
  <h2 class="font-serif text-3xl md:text-4xl text-forest">{c.whyTitle}</h2>
  <p class="text-muted-dark leading-relaxed mt-5 max-w-2xl">{c.whyBody1}</p>
  <p class="text-muted-dark leading-relaxed mt-4 max-w-2xl">{c.whyBody2}</p>
</section>

<section class="bg-card border-y border-gold/20">
  <div class="mx-auto max-w-6xl px-5 py-16 md:py-20 grid gap-10 md:grid-cols-2 items-center">
    <img src="/images/placeholder-orchard.jpg" alt="" loading="lazy" decoding="async" class="rounded-2xl aspect-[5/4] object-cover" />
    <div>
      <h2 class="font-serif text-3xl text-forest">{c.storyTitle}</h2>
      <p class="text-muted-dark leading-relaxed mt-4 max-w-lg">{c.storyBody}</p>
      <a href={getLocalizedPath('story', lang)} class="inline-block mt-6 text-sm uppercase tracking-wide text-gold-muted border-b border-gold-border/50 pb-1">{c.storyLink}</a>
    </div>
  </div>
</section>

<section class="bg-forest text-cream">
  <div class="mx-auto max-w-6xl px-5 py-16 md:py-20">
    <h2 class="font-serif text-3xl">{c.intlTitle}</h2>
    <p class="text-cream/80 leading-relaxed mt-4 max-w-xl">{c.intlBody}</p>
    <a href={getLocalizedPath('export', lang)} class="inline-block mt-6 bg-gold text-forest-dark rounded-full px-6 py-3.5 text-sm font-semibold hover:bg-gold-light">{c.intlLink}</a>
  </div>
</section>

{featured.length > 0 && (
  <section class="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <span class="text-xs uppercase tracking-[0.28em] text-gold-muted">{c.featuredKicker}</span>
    <h2 class="font-serif text-3xl md:text-4xl text-forest mt-3">{c.featuredTitle}</h2>
    <div class="grid gap-7 mt-10" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))">
      {featured.map((entry) => (
        <VarietyCard entry={entry} slug={slugFromId(entry.id)} lang={lang} viewLabel={c.viewLabel} />
      ))}
    </div>
  </section>
)}

<section class="bg-forest-dark text-cream text-center">
  <div class="mx-auto max-w-2xl px-5 py-16">
    <p class="font-serif text-2xl md:text-3xl">{c.finalCta}</p>
    <div class="mt-7 flex justify-center">
      <WhatsAppButton message={t.whatsapp.generic} label={t.ctaOrder} />
    </div>
  </div>
</section>
```

- [ ] **Step 4: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HomeContent from '../components/HomeContent.astro';
import { meta } from '../i18n/meta';
---
<BaseLayout title={meta.id.home.title} description={meta.id.home.description} lang="id" alternatePath="/en/">
  <HomeContent lang="id" />
</BaseLayout>
```

- [ ] **Step 5: Write `src/pages/en/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import HomeContent from '../../components/HomeContent.astro';
import { meta } from '../../i18n/meta';
---
<BaseLayout title={meta.en.home.title} description={meta.en.home.description} lang="en" alternatePath="/">
  <HomeContent lang="en" />
</BaseLayout>
```

- [ ] **Step 6: Build and verify both locales render real content**

Run: `npm run build`

Run: `grep -o 'Raja Durian dari Rimba Bukit Lawang' dist/index.html`
Expected: one match.

Run: `grep -o 'The King of Durians, from the Bukit Lawang Rainforest' dist/en/index.html`
Expected: one match.

Run: `grep -c 'wa.me' dist/index.html`
Expected: at least `2` (hero CTA + final CTA).

Run: `grep -o 'Musang King' dist/index.html | head -1`
Expected: one match (featured variety card).

- [ ] **Step 7: Commit**

```bash
git add src/components/WhatsAppButton.astro src/components/VarietyCard.astro src/components/HomeContent.astro src/pages/index.astro src/pages/en/index.astro
git commit -m "Build bilingual Home page with hero, promises, why-us, story teaser, international callout, featured varieties"
```

---

## Task 10: Varieties listing page (id + en)

**Files:**
- Create: `src/components/VarietiesListContent.astro`
- Create: `src/pages/varietas/index.astro`
- Create: `src/pages/en/varieties/index.astro`

**Interfaces:**
- Consumes: `VarietyCard` (Task 9), `getVarietiesForLocale`, `slugFromId` (Task 4), `meta` (Task 8), `BaseLayout` (Task 7).

- [ ] **Step 1: Write `src/components/VarietiesListContent.astro`**

```astro
---
import VarietyCard from './VarietyCard.astro';
import { getVarietiesForLocale, slugFromId } from '../content/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale }
const { lang } = Astro.props;
const varieties = await getVarietiesForLocale(lang);

const copy = {
  id: {
    kicker: 'Varietas Kami',
    title: 'Lima Varietas Premium, Satu Kebun Muda',
    body:
      'Setiap varietas yang kami tanam dipilih dengan cermat dan dirawat di tanah subur Bukit Lawang. Karena kebun kami masih muda, kami belum menetapkan tingkatan grade formal — yang kami jamin adalah standar pemilihan yang sama untuk setiap buah, dari Musang King hingga Chanee.',
    viewLabel: 'Lihat',
  },
  en: {
    kicker: 'Our Varieties',
    title: 'Five Premium Varieties, One Young Orchard',
    body:
      "Every variety we grow is chosen carefully and raised in the fertile soil of Bukit Lawang. Because our orchard is still young, we haven't set formal grade tiers yet — what we guarantee is the same selection standard for every fruit, from Musang King to Chanee.",
    viewLabel: 'View',
  },
} as const;
const c = copy[lang];
---
<div class="mx-auto max-w-6xl px-5 py-14 md:py-20">
  <span class="text-xs uppercase tracking-[0.28em] text-gold-muted">{c.kicker}</span>
  <h1 class="font-serif text-4xl md:text-6xl text-forest mt-4">{c.title}</h1>
  <p class="text-muted-dark leading-relaxed mt-5 max-w-2xl">{c.body}</p>
  <div class="grid gap-7 mt-12" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))">
    {varieties.map((entry) => (
      <VarietyCard entry={entry} slug={slugFromId(entry.id)} lang={lang} viewLabel={c.viewLabel} />
    ))}
  </div>
</div>
```

- [ ] **Step 2: Write `src/pages/varietas/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import VarietiesListContent from '../../components/VarietiesListContent.astro';
import { meta } from '../../i18n/meta';
---
<BaseLayout title={meta.id.varieties.title} description={meta.id.varieties.description} lang="id" alternatePath="/en/varieties/">
  <VarietiesListContent lang="id" />
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/en/varieties/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import VarietiesListContent from '../../../components/VarietiesListContent.astro';
import { meta } from '../../../i18n/meta';
---
<BaseLayout title={meta.en.varieties.title} description={meta.en.varieties.description} lang="en" alternatePath="/varietas/">
  <VarietiesListContent lang="en" />
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`

Run: `grep -c 'class="block rounded-2xl' dist/varietas/index.html`
Expected: `5` (one per seeded variety).

Run: `grep -o 'Five Premium Varieties, One Young Orchard' dist/en/varieties/index.html`
Expected: one match.

- [ ] **Step 5: Commit**

```bash
git add src/components/VarietiesListContent.astro src/pages/varietas src/pages/en/varieties/index.astro
git commit -m "Add bilingual varieties listing page"
```

---

## Task 11: Variety detail page (id + en)

**Files:**
- Create: `src/components/FlavorBar.astro`
- Create: `src/components/Breadcrumbs.astro`
- Create: `src/lib/jsonld.ts`
- Create: `src/components/VarietyDetail.astro`
- Create: `src/pages/varietas/[slug].astro`
- Create: `src/pages/en/varieties/[slug].astro`

**Interfaces:**
- Consumes: `getVarietiesForLocale`, `slugFromId` (Task 4), `varietyMeta` (Task 8), `useTranslations`, `getLocalizedPath` (Task 2), `WhatsAppButton` (Task 9).
- Produces: `productJsonLd(entry, siteUrl)`, `breadcrumbListJsonLd(items, siteUrl)` from `src/lib/jsonld.ts`.

- [ ] **Step 1: Write `src/components/FlavorBar.astro`**

```astro
---
interface Props { label: string; score: number }
const { label, score } = Astro.props;
const pct = score * 20;
---
<div>
  <div class="flex justify-between text-xs uppercase tracking-wide text-muted mb-2">
    <span>{label}</span><span class="text-gold-muted">{score}/5</span>
  </div>
  <div class="h-1.5 rounded-full bg-gold/15 overflow-hidden">
    <div class="h-full rounded-full bg-gradient-to-r from-gold-border to-gold-light" style={`width:${pct}%`}></div>
  </div>
</div>
```

- [ ] **Step 2: Write `src/components/Breadcrumbs.astro`**

```astro
---
interface Crumb { name: string; href: string }
interface Props { items: Crumb[] }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="text-xs text-muted mb-6">
  <ol class="flex flex-wrap gap-1.5 items-center">
    {items.map((item, i) => (
      <li class="flex items-center gap-1.5">
        {i > 0 && <span aria-hidden="true">/</span>}
        {i === items.length - 1 ? (
          <span class="text-forest">{item.name}</span>
        ) : (
          <a href={item.href} class="hover:text-forest">{item.name}</a>
        )}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 3: Write `src/lib/jsonld.ts`**

```ts
import type { CollectionEntry } from 'astro:content';

export function productJsonLd(entry: CollectionEntry<'varieties'>, siteUrl: string) {
  const image = entry.data.images[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entry.data.name,
    description: entry.data.tagline,
    brand: { '@type': 'Brand', name: 'Durian Sriraja' },
    ...(image ? { image: new URL(image.src, siteUrl).toString() } : {}),
  };
}

export function breadcrumbListJsonLd(items: { name: string; href: string }[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.href, siteUrl).toString(),
    })),
  };
}
```

- [ ] **Step 4: Write `src/components/VarietyDetail.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import FlavorBar from './FlavorBar.astro';
import WhatsAppButton from './WhatsAppButton.astro';
import Breadcrumbs from './Breadcrumbs.astro';
import { useTranslations, getLocalizedPath } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { entry: CollectionEntry<'varieties'>; lang: Locale }
const { entry, lang } = Astro.props;
const { name, tagline, grade, season, origin, priceNote, images, flavorProfile } = entry.data;
const t = useTranslations(lang);
const image = images[0];
const flavours = [
  { label: lang === 'id' ? 'Manis' : 'Sweetness', score: flavorProfile.sweetness },
  { label: lang === 'id' ? 'Pahit' : 'Bitterness', score: flavorProfile.bitterness },
  { label: lang === 'id' ? 'Legit' : 'Creaminess', score: flavorProfile.creaminess },
];
const waMessage = t.whatsapp.variety(name);
---
<section class="relative min-h-[380px] flex items-end bg-forest">
  <img src={image?.src ?? '/images/placeholder-durian.jpg'} alt={image?.alt ?? name} class="absolute inset-0 h-full w-full object-cover opacity-60" />
  <div class="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-transparent"></div>
  <div class="relative mx-auto max-w-6xl w-full px-5 py-12">
    <Breadcrumbs
      items={[
        { name: t.nav.home, href: getLocalizedPath('home', lang) },
        { name: t.nav.varieties, href: getLocalizedPath('varieties', lang) },
        { name, href: '#' },
      ]}
    />
    <div class="flex items-baseline gap-4 flex-wrap">
      <h1 class="font-serif text-cream text-4xl md:text-6xl">{name}</h1>
      <span class="border border-gold-light text-gold-light text-xs uppercase tracking-widest rounded-full px-3 py-1.5">{grade}</span>
    </div>
    <p class="text-cream/85 italic mt-3 max-w-lg">{tagline}</p>
  </div>
</section>

<div class="mx-auto max-w-6xl px-5 py-14 grid gap-12 md:grid-cols-2 items-start">
  <div>
    <div class="text-lg leading-relaxed text-muted-deep space-y-4">
      <slot />
    </div>
    <h3 class="font-serif text-xl text-forest mt-9 mb-5">{lang === 'id' ? 'Profil Rasa' : 'Flavour Profile'}</h3>
    <div class="flex flex-col gap-5">
      {flavours.map((f) => <FlavorBar label={f.label} score={f.score} />)}
    </div>
  </div>

  <aside class="bg-card border border-gold/25 rounded-2xl p-7 shadow-lg">
    <div class="flex justify-between gap-4 py-3.5 border-b border-gold/18">
      <span class="text-xs uppercase tracking-wide text-gold-muted">{lang === 'id' ? 'Asal' : 'Origin'}</span>
      <span class="text-sm text-right">{origin}</span>
    </div>
    <div class="flex justify-between gap-4 py-3.5 border-b border-gold/18">
      <span class="text-xs uppercase tracking-wide text-gold-muted">{lang === 'id' ? 'Musim' : 'Season'}</span>
      <span class="text-sm text-right">{season}</span>
    </div>
    <div class="flex justify-between gap-4 py-3.5">
      <span class="text-xs uppercase tracking-wide text-gold-muted">Grade</span>
      <span class="text-sm text-right">{grade}</span>
    </div>
    <p class="text-sm text-muted mt-4">{priceNote}</p>
    <div class="mt-6">
      <WhatsAppButton message={waMessage} label={t.ctaOrder} />
    </div>
  </aside>
</div>
```

- [ ] **Step 5: Write `src/pages/varietas/[slug].astro`**

```astro
---
import { render } from 'astro:content';
import { getVarietiesForLocale, slugFromId } from '../../content/utils';
import BaseLayout from '../../layouts/BaseLayout.astro';
import VarietyDetail from '../../components/VarietyDetail.astro';
import { varietyMeta } from '../../i18n/meta';
import { productJsonLd, breadcrumbListJsonLd } from '../../lib/jsonld';
import { getLocalizedPath } from '../../i18n/utils';

export async function getStaticPaths() {
  const entries = await getVarietiesForLocale('id');
  return entries.map((entry) => ({
    params: { slug: slugFromId(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const lang = 'id' as const;
const slug = slugFromId(entry.id);
const { title, description } = varietyMeta(lang, entry.data);
const siteUrl = (Astro.site ?? new URL('https://duriansriraja.com')).toString();
const jsonLd = [
  productJsonLd(entry, siteUrl),
  breadcrumbListJsonLd(
    [
      { name: 'Beranda', href: getLocalizedPath('home', lang) },
      { name: 'Varietas', href: getLocalizedPath('varieties', lang) },
      { name: entry.data.name, href: `/varietas/${slug}/` },
    ],
    siteUrl
  ),
];
---
<BaseLayout
  title={title}
  description={description}
  lang={lang}
  alternatePath={`/en/varieties/${slug}/`}
  ogImage={entry.data.images[0]?.src}
  jsonLd={jsonLd}
>
  <VarietyDetail entry={entry} lang={lang}>
    <Content />
  </VarietyDetail>
</BaseLayout>
```

- [ ] **Step 6: Write `src/pages/en/varieties/[slug].astro`**

```astro
---
import { render } from 'astro:content';
import { getVarietiesForLocale, slugFromId } from '../../../content/utils';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import VarietyDetail from '../../../components/VarietyDetail.astro';
import { varietyMeta } from '../../../i18n/meta';
import { productJsonLd, breadcrumbListJsonLd } from '../../../lib/jsonld';
import { getLocalizedPath } from '../../../i18n/utils';

export async function getStaticPaths() {
  const entries = await getVarietiesForLocale('en');
  return entries.map((entry) => ({
    params: { slug: slugFromId(entry.id) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const lang = 'en' as const;
const slug = slugFromId(entry.id);
const { title, description } = varietyMeta(lang, entry.data);
const siteUrl = (Astro.site ?? new URL('https://duriansriraja.com')).toString();
const jsonLd = [
  productJsonLd(entry, siteUrl),
  breadcrumbListJsonLd(
    [
      { name: 'Home', href: getLocalizedPath('home', lang) },
      { name: 'Varieties', href: getLocalizedPath('varieties', lang) },
      { name: entry.data.name, href: `/en/varieties/${slug}/` },
    ],
    siteUrl
  ),
];
---
<BaseLayout
  title={title}
  description={description}
  lang={lang}
  alternatePath={`/varietas/${slug}/`}
  ogImage={entry.data.images[0]?.src}
  jsonLd={jsonLd}
>
  <VarietyDetail entry={entry} lang={lang}>
    <Content />
  </VarietyDetail>
</BaseLayout>
```

- [ ] **Step 7: Build and verify**

Run: `npm run build`

Run: `test -f dist/varietas/musang-king/index.html && test -f dist/en/varieties/musang-king/index.html && echo OK`
Expected: `OK`.

Run: `grep -o '"@type":"Product"' dist/varietas/musang-king/index.html`
Expected: one match.

Run: `grep -o '"@type":"BreadcrumbList"' dist/varietas/musang-king/index.html`
Expected: one match.

Run: `grep -o 'Sang raja durian' dist/varietas/musang-king/index.html`
Expected: one match (markdown body content rendered via `<Content />`).

- [ ] **Step 8: Commit**

```bash
git add src/components/FlavorBar.astro src/components/Breadcrumbs.astro src/lib/jsonld.ts src/components/VarietyDetail.astro src/pages/varietas/[slug].astro src/pages/en/varieties/[slug].astro
git commit -m "Add bilingual variety detail pages with flavor bars, breadcrumbs, and Product/BreadcrumbList JSON-LD"
```

---

## Task 12: Our Story page (id + en)

**Files:**
- Create: `src/components/OurStoryContent.astro`
- Create: `src/pages/cerita-kami/index.astro`
- Create: `src/pages/en/our-story/index.astro`

- [ ] **Step 1: Write `src/components/OurStoryContent.astro`**

```astro
---
import WhatsAppButton from './WhatsAppButton.astro';
import { useTranslations } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale }
const { lang } = Astro.props;
const t = useTranslations(lang);

const copy = {
  id: {
    title: 'Cerita Kami',
    sections: [
      {
        title: 'Berawal dari Bukit Lawang',
        body: 'Keluarga kami tinggal di Bukit Lawang, Sumatera Utara — sebuah desa kecil di tepi hutan hujan Taman Nasional Gunung Leuser, terkenal dengan orangutan dan sungainya yang jernih. Di sinilah orang tua kami, Susanto Ciang dan Sri Astuti, menjalankan sebuah tempat retret mindfulness bagi mereka yang ingin memperlambat langkah dan kembali ke alam.',
      },
      {
        title: 'Kenapa Durian',
        body: 'Bagi keluarga kami, menanam durian adalah bentuk kesabaran. Sama seperti meditasi, kebun ini tumbuh perlahan — pohon yang ditanam hari ini baru berbuah bertahun-tahun kemudian. Pada tahun 2021, kami mulai menanami lahan seluas 8 hektar dengan lebih dari 700 pohon durian premium.',
      },
      {
        title: 'Kebun yang Sedang Tumbuh',
        body: 'Kebun kami masih muda, dan justru di situlah letak keistimewaannya — Anda menyaksikan sebuah kebun durian tumbuh dari awal. Kami menanam bibit varietas terbaik seperti Musang King, Black Thorn, dan Monthong, merawatnya di tanah subur Bukit Lawang, dan kini memasuki masa panen premium pertama kami.',
      },
      {
        title: 'Nama Kami',
        body: '"Sri Raja" membawa dua makna bagi kami: nama keluarga kami, dan gelar bagi sang raja buah. Kedua hal itulah yang kami tanam di setiap pohon.',
      },
      {
        title: 'Sebuah Undangan',
        body: 'Menikmati durian paling nikmat adalah di tempat ia tumbuh. Kebun kami berada jauh di dalam hutan — sekitar 30 menit berjalan kaki menembus rimba dan menyeberangi sungai. Bagi yang bersedia menempuhnya, ada pengalaman langka menanti: menyantap durian segar, langsung dari pohonnya, di tengah salah satu hutan tertua di dunia.',
      },
    ],
  },
  en: {
    title: 'Our Story',
    sections: [
      {
        title: 'It Began in Bukit Lawang',
        body: 'Our family lives in Bukit Lawang, North Sumatra — a small village on the edge of the Gunung Leuser National Park rainforest, famous for its orangutans and clear rivers. Here our parents, Susanto Ciang and Sri Astuti, run a mindfulness retreat for people who want to slow down and return to nature.',
      },
      {
        title: 'Why Durian',
        body: "For our family, growing durian is an act of patience. Like meditation, this orchard grows slowly — a tree planted today only bears fruit years later. In 2021, we began planting 8 hectares of land with more than 700 premium durian trees.",
      },
      {
        title: 'A Growing Orchard',
        body: "Our orchard is young, and that's exactly what makes it special — you're watching a durian farm grow from the very beginning. We planted the finest varieties, including Musang King, Black Thorn, and Monthong, nurtured them in the fertile soil of Bukit Lawang, and are now entering our first premium harvests.",
      },
      {
        title: 'Our Name',
        body: '"Sri Raja" carries two meanings for us: our family name, and a title for the king of fruits. Both are what we plant into every tree.',
      },
      {
        title: 'An Invitation',
        body: 'Durian tastes best where it grows. Our orchard lies deep in the jungle — about a 30-minute walk through the forest and across rivers. For those willing to make the journey, a rare experience awaits: eating durian fresh, straight from the tree, in one of the oldest rainforests on earth.',
      },
    ],
  },
} as const;
const c = copy[lang];
---
<div class="mx-auto max-w-3xl px-5 py-16 md:py-24 text-center">
  <span class="inline-block h-6 w-6 border border-gold-border rounded-tr-full rounded-bl-full"></span>
  <h1 class="font-serif text-4xl md:text-6xl text-forest mt-6">{c.title}</h1>
</div>

{c.sections.map((s) => (
  <section class="mx-auto max-w-3xl px-5 py-8">
    <h2 class="font-serif text-2xl md:text-3xl text-forest">{s.title}</h2>
    <p class="text-muted-dark leading-relaxed mt-4">{s.body}</p>
  </section>
))}

<div class="mx-auto max-w-3xl px-5 py-14 text-center">
  <WhatsAppButton message={t.whatsapp.generic} label={t.ctaOrder} />
</div>
```

- [ ] **Step 2: Write `src/pages/cerita-kami/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import OurStoryContent from '../../components/OurStoryContent.astro';
import { meta } from '../../i18n/meta';
---
<BaseLayout title={meta.id.story.title} description={meta.id.story.description} lang="id" alternatePath="/en/our-story/">
  <OurStoryContent lang="id" />
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/en/our-story/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import OurStoryContent from '../../../components/OurStoryContent.astro';
import { meta } from '../../../i18n/meta';
---
<BaseLayout title={meta.en.story.title} description={meta.en.story.description} lang="en" alternatePath="/cerita-kami/">
  <OurStoryContent lang="en" />
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`

Run: `grep -o 'Susanto Ciang dan Sri Astuti' dist/cerita-kami/index.html`
Expected: one match.

Run: `grep -o 'Susanto Ciang and Sri Astuti' dist/en/our-story/index.html`
Expected: one match.

- [ ] **Step 5: Commit**

```bash
git add src/components/OurStoryContent.astro src/pages/cerita-kami src/pages/en/our-story
git commit -m "Add bilingual Our Story page with the family's real narrative"
```

---

## Task 13: Export & Partnerships page (id + en)

**Files:**
- Create: `src/components/ExportContent.astro`
- Create: `src/pages/ekspor/index.astro`
- Create: `src/pages/en/export/index.astro`

- [ ] **Step 1: Write `src/components/ExportContent.astro`**

```astro
---
import WhatsAppButton from './WhatsAppButton.astro';
import { useTranslations } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale }
const { lang } = Astro.props;
const t = useTranslations(lang);

const copy = {
  id: {
    kicker: 'Ekspor & Kemitraan',
    title: 'Menyambut Pembeli dan Mitra dari Luar Negeri',
    lede:
      'Kebun kami masih muda, dan kami membangunnya bersama pembeli yang menghargai perjalanan itu sejak awal. Kami menyambut importir, distributor, dan mitra jangka panjang yang ingin bertumbuh bersama kami.',
    blocks: [
      { title: 'Kunjungi Kebun', body: 'Cara terbaik mengenal durian kami adalah datang langsung. Kami mengatur kunjungan kebun bagi calon mitra dan pembeli, termasuk mencicipi buah langsung dari pohon.' },
      { title: 'Panen Musiman', body: 'Sebagai kebun muda, kami baru memasuki musim panen premium pertama. Ketersediaan mengikuti musim buah yang sesungguhnya, bukan produksi massal.' },
      { title: 'Segar & Beku', body: 'Saat musim panen, kami kirim durian segar yang dikemas rapi. Di luar musim, tersedia durian beku berkualitas untuk permintaan yang berkelanjutan.' },
      { title: 'Kemitraan Jangka Panjang', body: 'Kami mencari mitra distribusi dan ekspor yang ingin membangun hubungan jangka panjang seiring kebun kami bertumbuh, bukan transaksi satu kali.' },
    ],
    selectTitle: 'Bagaimana Kami Memilih',
    selectBody:
      'Setiap durian yang kami jual dipetik matang dari pohon dan diperiksa langsung oleh keluarga sebelum dikirim — bukan dibeli dari pengepul. Karena kebun kami masih membangun rekam jejaknya, kami belum menetapkan tingkatan grade formal; yang kami jamin adalah setiap buah dipilih dengan standar yang sama ketatnya untuk pasar lokal maupun pembeli luar negeri.',
    enquiryTitle: 'Ingin Menjajaki Kemitraan?',
    enquiryBody:
      'Ceritakan kebutuhan Anda — negara tujuan, perkiraan volume, atau rencana kunjungan. Kami akan balas dan atur langkah berikutnya.',
    enquiryCta: 'Hubungi via WhatsApp',
  },
  en: {
    kicker: 'Export & Partnerships',
    title: 'Welcoming Overseas Buyers and Partners',
    lede:
      "Our orchard is still young, and we're building it together with buyers who value that journey from the start. We welcome importers, distributors, and long-term partners who want to grow alongside us.",
    blocks: [
      { title: 'Visit the Farm', body: 'The best way to get to know our durian is to come see it yourself. We arrange farm visits for prospective partners and buyers, including tasting fruit straight from the tree.' },
      { title: 'Seasonal Harvests', body: "As a young orchard, we're only just entering our first premium harvest season. Availability follows the real fruiting season, not mass production." },
      { title: 'Fresh & Frozen', body: 'In season, we ship fresh durian, carefully packed. Off-season, quality frozen durian is available for ongoing demand.' },
      { title: 'Long-Term Partnerships', body: "We're looking for distribution and export partners who want to build a long-term relationship as our orchard grows, not a one-off transaction." },
    ],
    selectTitle: 'How We Select Our Fruit',
    selectBody:
      "Every durian we sell is picked ripe from the tree and checked by the family before it ships — never bought from a collector. Since our orchard is still building its track record, we haven't set formal grade tiers yet; what we guarantee is that every fruit meets the same strict standard, for local buyers and overseas partners alike.",
    enquiryTitle: 'Want to Explore a Partnership?',
    enquiryBody:
      "Tell us what you need — destination country, expected volume, or a visit you'd like to plan. We'll reply and arrange next steps.",
    enquiryCta: 'Message Us on WhatsApp',
  },
} as const;
const c = copy[lang];
---
<section class="bg-forest text-cream">
  <div class="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <span class="text-xs uppercase tracking-[0.28em] text-gold-light">{c.kicker}</span>
    <h1 class="font-serif text-4xl md:text-6xl mt-4 max-w-2xl">{c.title}</h1>
    <p class="text-cream/85 leading-relaxed mt-5 max-w-2xl">{c.lede}</p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 md:py-20">
  <div class="grid gap-8" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))">
    {c.blocks.map((b) => (
      <div class="border-t border-gold-border pt-5">
        <h3 class="font-serif text-xl text-forest">{b.title}</h3>
        <p class="text-muted leading-relaxed mt-3">{b.body}</p>
      </div>
    ))}
  </div>
</section>

<section class="bg-card border-y border-gold/20">
  <div class="mx-auto max-w-6xl px-5 py-14 md:py-16">
    <h2 class="font-serif text-2xl md:text-3xl text-forest">{c.selectTitle}</h2>
    <p class="text-muted-dark leading-relaxed mt-4 max-w-3xl">{c.selectBody}</p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 md:py-20">
  <h2 class="font-serif text-3xl text-forest">{c.enquiryTitle}</h2>
  <p class="text-muted-dark leading-relaxed mt-4 max-w-xl">{c.enquiryBody}</p>
  <div class="mt-7">
    <WhatsAppButton message={t.whatsapp.partnership} label={c.enquiryCta} />
  </div>
</section>
```

- [ ] **Step 2: Write `src/pages/ekspor/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ExportContent from '../../components/ExportContent.astro';
import { meta } from '../../i18n/meta';
---
<BaseLayout title={meta.id.international.title} description={meta.id.international.description} lang="id" alternatePath="/en/export/">
  <ExportContent lang="id" />
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/en/export/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ExportContent from '../../../components/ExportContent.astro';
import { meta } from '../../../i18n/meta';
---
<BaseLayout title={meta.en.international.title} description={meta.en.international.description} lang="en" alternatePath="/ekspor/">
  <ExportContent lang="en" />
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`

Run: `grep -o 'Menyambut Pembeli dan Mitra dari Luar Negeri' dist/ekspor/index.html`
Expected: one match.

Run: `grep -o 'Welcoming Overseas Buyers and Partners' dist/en/export/index.html`
Expected: one match.

Run: `grep -c 'Grade A+' dist/ekspor/index.html`
Expected: `0` (confirms the old mockup's fabricated grading table was not carried over).

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportContent.astro src/pages/ekspor src/pages/en/export
git commit -m "Add bilingual Export & Partnerships page matching the young-farm story"
```

---

## Task 14: Contact page (id + en)

**Files:**
- Create: `src/components/ContactContent.astro`
- Create: `src/pages/kontak/index.astro`
- Create: `src/pages/en/contact/index.astro`

- [ ] **Step 1: Write `src/components/ContactContent.astro`**

```astro
---
import WhatsAppButton from './WhatsAppButton.astro';
import { useTranslations } from '../i18n/utils';
import type { Locale } from '../i18n/utils';

interface Props { lang: Locale }
const { lang } = Astro.props;
const t = useTranslations(lang);
const mapHref = 'https://maps.google.com/?q=Bukit+Lawang,+Langkat,+North+Sumatra';

const copy = {
  id: {
    title: 'Hubungi Kami',
    lede: 'Mau pesan durian premium atau berkunjung ke kebun? Cara tercepat menghubungi kami adalah lewat WhatsApp.',
    locationTitle: 'Lokasi Kebun',
    locationBody: 'Kebun Durian Sriraja berada di Bukit Lawang, Kabupaten Langkat, Sumatera Utara — di tepi Taman Nasional Gunung Leuser.',
    visitTitle: 'Kunjungan Kebun',
    visitBody:
      'Kami menyambut kunjungan langsung ke kebun. Harap diketahui: kebun berada jauh di dalam hutan, sekitar 30 menit berjalan kaki menembus rimba dan menyeberangi sungai — kenakan alas kaki yang nyaman. Kunjungan hanya dengan perjanjian sebelumnya, jadi hubungi kami dulu via WhatsApp untuk mengatur waktunya.',
    contactTitle: 'Kontak',
    whatsappLabel: 'WhatsApp',
    locationLabel: 'Lokasi',
    mapLink: 'Buka Peta',
    locationValue: 'Bukit Lawang, Kabupaten Langkat, Sumatera Utara',
  },
  en: {
    title: 'Contact Us',
    lede: 'Want to order premium durian or visit the farm? The fastest way to reach us is on WhatsApp.',
    locationTitle: 'Farm Location',
    locationBody: 'Durian Sriraja Farm is in Bukit Lawang, Langkat Regency, North Sumatra — on the edge of Gunung Leuser National Park.',
    visitTitle: 'Farm Visits',
    visitBody:
      'We welcome visitors to the orchard. Please note: the farm lies deep in the jungle, about a 30-minute walk through the forest and across rivers — wear comfortable footwear. Visits are by appointment only, so message us first on WhatsApp to arrange a time.',
    contactTitle: 'Get in Touch',
    whatsappLabel: 'WhatsApp',
    locationLabel: 'Location',
    mapLink: 'Open Map',
    locationValue: 'Bukit Lawang, Langkat Regency, North Sumatra',
  },
} as const;
const c = copy[lang];
---
<div class="mx-auto max-w-3xl px-5 py-16 md:py-24">
  <h1 class="font-serif text-4xl md:text-6xl text-forest">{c.title}</h1>
  <p class="text-muted-dark leading-relaxed mt-5 max-w-xl">{c.lede}</p>
  <div class="mt-7">
    <WhatsAppButton message={t.whatsapp.generic} label={t.ctaOrder} />
  </div>

  <section class="mt-14">
    <h2 class="font-serif text-2xl text-forest">{c.locationTitle}</h2>
    <p class="text-muted-dark leading-relaxed mt-3">{c.locationBody}</p>
  </section>

  <section class="mt-10">
    <h2 class="font-serif text-2xl text-forest">{c.visitTitle}</h2>
    <p class="text-muted-dark leading-relaxed mt-3">{c.visitBody}</p>
  </section>

  <section class="mt-10 border-t border-gold/20 pt-8">
    <h2 class="font-serif text-2xl text-forest">{c.contactTitle}</h2>
    <p class="mt-3"><strong>{c.whatsappLabel}:</strong> +62 831-9411-1119</p>
    <p class="mt-1"><strong>{c.locationLabel}:</strong> {c.locationValue}</p>
    <a href={mapHref} target="_blank" rel="noopener noreferrer" class="inline-block mt-5 text-sm uppercase tracking-wide text-gold-muted border-b border-gold-border/50 pb-1">{c.mapLink} →</a>
  </section>
</div>
```

- [ ] **Step 2: Write `src/pages/kontak/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ContactContent from '../../components/ContactContent.astro';
import { meta } from '../../i18n/meta';
---
<BaseLayout title={meta.id.contact.title} description={meta.id.contact.description} lang="id" alternatePath="/en/contact/">
  <ContactContent lang="id" />
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/en/contact/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ContactContent from '../../../components/ContactContent.astro';
import { meta } from '../../../i18n/meta';
---
<BaseLayout title={meta.en.contact.title} description={meta.en.contact.description} lang="en" alternatePath="/kontak/">
  <ContactContent lang="en" />
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`

Run: `grep -o '+62 831-9411-1119' dist/kontak/index.html`
Expected: one match.

Run: `grep -o 'Bukit+Lawang' dist/en/contact/index.html`
Expected: at least one match (map link).

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactContent.astro src/pages/kontak src/pages/en/contact
git commit -m "Add bilingual Contact page with real WhatsApp number and map link"
```

---

## Task 15: Custom 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404 — Durian Sriraja" description="Page not found." lang="id" alternatePath="/">
  <div class="mx-auto max-w-2xl px-5 py-24 text-center">
    <p class="font-serif text-6xl text-forest">404</p>
    <div id="msg-id">
      <h1 class="font-serif text-2xl text-forest mt-4">Halaman tidak ditemukan</h1>
      <p class="text-muted-dark mt-3">Halaman yang Anda cari tidak tersedia.</p>
      <a href="/" class="inline-block mt-6 text-sm uppercase tracking-wide text-gold-muted border-b border-gold-border/50 pb-1">Kembali ke Beranda</a>
    </div>
    <div id="msg-en" hidden>
      <h1 class="font-serif text-2xl text-forest mt-4">Page not found</h1>
      <p class="text-muted-dark mt-3">The page you're looking for doesn't exist.</p>
      <a href="/en/" class="inline-block mt-6 text-sm uppercase tracking-wide text-gold-muted border-b border-gold-border/50 pb-1">Back to Home</a>
    </div>
  </div>
</BaseLayout>
<script>
  if (window.location.pathname.startsWith('/en')) {
    document.getElementById('msg-id')?.setAttribute('hidden', '');
    document.getElementById('msg-en')?.removeAttribute('hidden');
  }
</script>
```

(This is the only page on the site with client-side JS — a 404 page can't know which locale the visitor wanted from a single prerendered file, so a tiny inline script toggles the visible block based on the requested path. Every content page stays at zero client JS.)

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Run: `test -f dist/404.html && grep -o 'Halaman tidak ditemukan' dist/404.html && grep -o 'Page not found' dist/404.html`
Expected: file exists, both strings present (one visible by default, one behind `hidden` toggled by the script).

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "Add bilingual custom 404 page"
```

---

## Task 16: Sitemap, robots.txt, and full-build verification

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/robots.txt`

- [ ] **Step 1: Install the sitemap integration dependency (already in `package.json` from Task 1) and add it to the config**

Modify `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://duriansriraja.com',
  output: 'static',
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'id',
        locales: { id: 'id', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Write `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://duriansriraja.com/sitemap-index.xml
```

- [ ] **Step 3: Full build and verify the sitemap covers every route**

Run: `npm run build`

Run: `test -f dist/sitemap-index.xml && echo OK`
Expected: `OK`.

Run: `cat dist/sitemap-index.xml`
Expected: references at least one `sitemap-0.xml` (or similar) child sitemap.

Run: `grep -o 'duriansriraja.com/varietas/musang-king/' dist/sitemap-0.xml dist/sitemap-*.xml 2>/dev/null | head -1`
Expected: one match (adjust the sitemap filename to whatever `@astrojs/sitemap` actually generated, printed by the previous `cat` command).

Run: `grep -o 'duriansriraja.com/en/varieties/musang-king/' dist/sitemap-*.xml`
Expected: one match.

Run: `test -f dist/robots.txt && grep -o 'sitemap-index.xml' dist/robots.txt`
Expected: file exists and references the sitemap.

- [ ] **Step 4: Verify every page route built successfully**

Run:
```bash
for p in index.html en/index.html varietas/index.html en/varieties/index.html \
  varietas/musang-king/index.html varietas/black-thorn/index.html varietas/monthong/index.html \
  varietas/sultan/index.html varietas/chanee/index.html \
  en/varieties/musang-king/index.html en/varieties/black-thorn/index.html en/varieties/monthong/index.html \
  en/varieties/sultan/index.html en/varieties/chanee/index.html \
  cerita-kami/index.html en/our-story/index.html ekspor/index.html en/export/index.html \
  kontak/index.html en/contact/index.html 404.html; do
  test -f "dist/$p" || echo "MISSING: $p"
done
echo "check complete"
```
Expected: no `MISSING:` lines, ends with `check complete`.

- [ ] **Step 5: Run the full test suite one more time**

Run: `npm run test`
Expected: all vitest suites (i18n, config) pass.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs public/robots.txt
git commit -m "Wire sitemap generation with i18n alternates and robots.txt"
```

---

## Task 17: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README with setup, content, and deploy instructions"
```

---

## Self-Review Notes

- **Spec coverage:** every spec section (§2 tech stack, §3 i18n, §4 content model incl. Chanee/1-5 scale, §5 design tokens, §6 real placeholder images, §7 all 7 page-types with final copy, §8 WhatsApp with real number, §9 SEO incl. `meta.ts`/JSON-LD/sitemap, §10 non-functional, §11 README) maps to a task above.
- **Deliberate deviation from spec §9.2:** the spec said variety `Product` JSON-LD should include `offers.availability`. This plan omits `offers` entirely (Task 11) since no numeric price is published and `availability` alone would be an unverifiable claim; `Product` still carries `name`/`description`/`brand`/`image`, which is valid without `offers`. Documented here since it wasn't re-confirmed with the user.
- **Type consistency checked:** `Locale` type flows from `src/i18n/ui.ts` → `src/i18n/utils.ts` → every component; `getVarietiesForLocale`/`slugFromId` signatures match between Task 4's definition and every later consumer; `waLink` signature matches between Task 3 and `WhatsAppButton.astro`; `varietyMeta` signature matches between Task 8 and Task 11's two page files.
- **No placeholders:** every step contains real, copy-pasteable code or exact shell commands; all page copy is either verbatim from the user or explicitly marked spec-authored (Varieties listing intro, Export & Partnerships page, footer blurb) with full text supplied, not TBD.

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

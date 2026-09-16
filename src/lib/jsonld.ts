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

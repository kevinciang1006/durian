import type { CollectionEntry } from 'astro:content';

export function productJsonLd(
  entry: CollectionEntry<'varieties'>,
  siteUrl: string,
  imageUrl?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entry.data.name,
    description: entry.data.tagline,
    brand: { '@type': 'Brand', name: 'Durian Sriraja' },
    ...(imageUrl ? { image: new URL(imageUrl, siteUrl).toString() } : {}),
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

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

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

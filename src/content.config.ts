import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Every translatable string must exist in all three languages.
 * A missing translation fails the build loudly instead of rendering an
 * empty element — this is deliberate, so incomplete client content is caught
 * before it reaches production.
 */
const localizedString = z.object({
  ar: z.string().min(1, 'Arabic translation is required'),
  en: z.string().min(1, 'English translation is required'),
  fr: z.string().min(1, 'French translation is required'),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      /** Primary card / hero image. Path is relative to this JSON file. */
      image: image(),
      /** Optional extra shots for the detail-page gallery. */
      gallery: z.array(image()).optional(),
      category: z.enum(['fruits', 'vegetables']),
      /** Sort weight for listings — lower comes first. */
      order: z.number().default(100),
      name: localizedString,
      description: localizedString,
      season: localizedString,
      packaging: localizedString,
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      coverImage: image(),
      /** ISO date, e.g. "2026-05-14" */
      publishDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'publishDate must be an ISO date (YYYY-MM-DD)'),
      title: localizedString,
      excerpt: localizedString,
      /** Markdown source, one per language. */
      content: localizedString,
    }),
});

export const collections = { products, blog };

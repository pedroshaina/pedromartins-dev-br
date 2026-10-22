import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { locales, type Locale } from './i18n/locales';

const posts = defineCollection({
  loader: glob({ pattern: `**/{${locales.join(',')}}.md`, base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    project: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const localized = z.object({
  title: z.string(),
  summary: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    repo: z.url().optional(),
    website: z.url().optional(),
  }).extend(
    Object.fromEntries(locales.map((l) => [l, localized])) as Record<Locale, typeof localized>,
  ),
});

export const collections = { posts, projects };

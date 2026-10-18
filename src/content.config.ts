import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One folder per post, one file per language: the id is `<slug>/<locale>`.
const posts = defineCollection({
  loader: glob({ pattern: '**/{en,pt-br}.md', base: './src/content/posts' }),
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

// One YAML file per project, both languages required.
const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    repo: z.url().optional(),
    website: z.url().optional(),
    en: localized,
    'pt-br': localized,
  }),
});

export const collections = { posts, projects };

import { getCollection, type CollectionEntry } from 'astro:content';
import { locales, localizedPath, type Locale } from '@/i18n/locales';

export type Post = { slug: string; locale: Locale; entry: CollectionEntry<'posts'> };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  repo?: string;
  website?: string;
  order: number;
};

/** Post ids are `<slug>/<locale>` (one folder per post, one file per language). */
function splitId(id: string): { slug: string; locale: Locale } {
  const i = id.lastIndexOf('/');
  return { slug: id.slice(0, i), locale: id.slice(i + 1) as Locale };
}

/**
 * Throws if a published post lacks a language, or names a project that doesn't exist. A slug is
 * published when any of its files is not a draft; then every language needs a non-draft file.
 */
export function assertTranslations(
  entries: CollectionEntry<'posts'>[],
  projectIds: readonly string[],
): void {
  const published = new Map<string, Set<Locale>>();
  const unknownProjects: string[] = [];
  for (const entry of entries) {
    if (entry.data.draft) continue;
    const { slug, locale } = splitId(entry.id);
    if (!published.has(slug)) published.set(slug, new Set());
    published.get(slug)!.add(locale);
    if (entry.data.project && !projectIds.includes(entry.data.project)) {
      unknownProjects.push(`${entry.id} → ${entry.data.project}`);
    }
  }

  const missing: string[] = [];
  for (const [slug, present] of [...published].sort(([a], [b]) => a.localeCompare(b))) {
    for (const locale of locales) {
      if (!present.has(locale)) missing.push(`${slug} (${locale})`);
    }
  }

  const problems: string[] = [];
  if (missing.length) problems.push(`Missing translations: ${missing.join(', ')}`);
  if (unknownProjects.length) problems.push(`Unknown projects: ${unknownProjects.join(', ')}`);
  if (problems.length) throw new Error(problems.join('; '));
}

// `![](src)` / `![ ](src)` and `<img>` without a non-empty alt attribute.
const imageWithoutAlt = /!\[\s*\]\(([^)]*)\)|<img\b(?![^>]*\balt\s*=\s*["'][^"']*\S)[^>]*>/g;

export function assertImageAlts(entries: CollectionEntry<'posts'>[]): void {
  const missing = entries.flatMap((entry) =>
    [...(entry.body ?? '').matchAll(imageWithoutAlt)].map((m) => `${entry.id}: ${m[1] ?? m[0]}`),
  );
  if (missing.length) throw new Error(`Images without alt text: ${missing.join(', ')}`);
}

let checked: Promise<void> | undefined;

function checkOnce(): Promise<void> {
  checked ??= (async () => {
    const [posts, projects] = await Promise.all([
      getCollection('posts'),
      getCollection('projects'),
    ]);
    assertTranslations(
      posts,
      projects.map((p) => p.id),
    );
    assertImageAlts(posts);
  })();
  return checked;
}

/** Newest first. `astro dev` includes drafts. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  await checkOnce();
  const entries = await getCollection(
    'posts',
    (e) => splitId(e.id).locale === locale && (import.meta.env.DEV || !e.data.draft),
  );
  return entries
    .map((entry) => ({ ...splitId(entry.id), entry }))
    .sort((a, b) => b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime());
}

export async function getProjects(locale: Locale): Promise<Project[]> {
  const entries = await getCollection('projects');
  return entries
    .map(({ id, data }) => ({
      slug: id,
      title: data[locale].title,
      summary: data[locale].summary,
      repo: data.repo,
      website: data.website,
      order: data.order,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getSeries(
  post: Post,
  posts: Post[],
): { index: number; total: number; prev?: Post; next?: Post } | undefined {
  const project = post.entry.data.project;
  if (!project) return undefined;
  const series = posts
    .filter((p) => p.locale === post.locale && p.entry.data.project === project)
    .sort((a, b) => a.entry.data.pubDate.getTime() - b.entry.data.pubDate.getTime());
  const i = series.findIndex((p) => p.slug === post.slug);
  if (i === -1) return undefined;
  return { index: i + 1, total: series.length, prev: series[i - 1], next: series[i + 1] };
}

export function postHref(post: Post): string {
  return localizedPath(`/blog/${post.slug}/`, post.locale);
}

/** No link for 0 posts, the post itself for 1, the project's filtered list for 2+. */
export function projectBlogHref(
  project: Project,
  posts: Post[],
  locale: Locale,
): string | undefined {
  const own = posts.filter((p) => p.locale === locale && p.entry.data.project === project.slug);
  if (own.length === 0) return undefined;
  if (own.length === 1) return postHref(own[0]);
  return localizedPath(`/blog/project/${project.slug}/`, locale);
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

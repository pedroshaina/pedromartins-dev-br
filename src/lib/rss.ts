import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { languageTag, localizedPath, type Locale } from '@/i18n/locales';
import { t } from '@/i18n/ui';
import { getPosts, postHref } from './content';

export async function feed(context: APIContext, locale: Locale): Promise<Response> {
  const s = t(locale);
  const posts = await getPosts(locale);
  return rss({
    title: s.rss.title,
    description: s.blog.description,
    site: new URL(localizedPath('/', locale), context.site),
    trailingSlash: true,
    customData: `<language>${languageTag[locale]}</language>`,
    items: posts.map((post) => ({
      title: post.entry.data.title,
      description: post.entry.data.description,
      pubDate: post.entry.data.pubDate,
      link: new URL(postHref(post), context.site).href,
    })),
  });
}

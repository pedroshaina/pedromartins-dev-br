import type { APIContext, GetStaticPaths } from 'astro';
import { localePaths, type Locale } from '@/i18n/locales';
import { feed } from '@/lib/rss';

export const getStaticPaths = (() => localePaths()) satisfies GetStaticPaths;

export const GET = (context: APIContext) => feed(context, context.props.locale as Locale);

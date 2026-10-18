export type Locale = 'en' | 'pt-br';

export const locales: readonly Locale[] = ['en', 'pt-br'];

export const defaultLocale: Locale = 'en';

/** BCP 47 tags, for `<html lang>`, hreflang and Intl. */
export const languageTag: Record<Locale, string> = {
  en: 'en',
  'pt-br': 'pt-BR',
};

const ptPrefix = /^\/pt-br(?=\/|$)/;

export function getLocale(url: URL): Locale {
  return ptPrefix.test(url.pathname) ? 'pt-br' : 'en';
}

/** The same page in `locale`: strips or adds the `/pt-br` prefix and keeps the rest of the path. */
export function localizedPath(path: string, locale: Locale): string {
  const bare = path.replace(ptPrefix, '') || '/';
  return locale === 'en' ? bare : `/pt-br${bare}`;
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(languageTag[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

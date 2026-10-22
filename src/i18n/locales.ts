// Adding a language: list it here, fill its entries below and in `ui.ts`, and translate the content.
export const locales = ['en', 'pt-br'] as const;

export type Locale = (typeof locales)[number];

/** Served without a prefix; every other locale lives under `/<locale>/`. */
export const defaultLocale: Locale = 'en';

/** BCP 47 tags, for `<html lang>`, hreflang and Intl. */
export const languageTag: Record<Locale, string> = {
  en: 'en',
  'pt-br': 'pt-BR',
};

export const switchLabel: Record<Locale, string> = {
  en: 'EN',
  'pt-br': 'PT',
};

export const prefixedLocales = locales.filter((l) => l !== defaultLocale);

const prefix = new RegExp(`^/(${prefixedLocales.join('|')})(?=/|$)`);

export function localizedPath(path: string, locale: Locale): string {
  const bare = path.replace(prefix, '') || '/';
  return locale === defaultLocale ? bare : `/${locale}${bare}`;
}

/** The default locale's 404 is Astro's `404.html`; the others are routes. */
export function notFoundPath(locale: Locale): string {
  return locale === defaultLocale ? '/404.html' : `/${locale}/404/`;
}

/** For a `[...locale]` route: the default locale gets no param, so it builds at the root. */
export function localePaths(only: readonly Locale[] = locales) {
  return only.map((locale) => ({
    params: { locale: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }));
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(languageTag[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

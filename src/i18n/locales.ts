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

/** What the language switch shows for each locale. */
export const switchLabel: Record<Locale, string> = {
  en: 'EN',
  'pt-br': 'PT',
};

/** Every locale but the default. */
export const prefixedLocales = locales.filter((l) => l !== defaultLocale);

const prefix = new RegExp(`^/(${prefixedLocales.join('|')})(?=/|$)`);

/** The same page in `locale`: strips or adds the locale prefix and keeps the rest of the path. */
export function localizedPath(path: string, locale: Locale): string {
  const bare = path.replace(prefix, '') || '/';
  return locale === defaultLocale ? bare : `/${locale}${bare}`;
}

/** The 404 page in `locale`. The default one is Astro's `404.html`; the others are routes. */
export function notFoundPath(locale: Locale): string {
  return locale === defaultLocale ? '/404.html' : `/${locale}/404/`;
}

/**
 * `getStaticPaths` entries for a `[...locale]` route: one per locale, the default with no param
 * so it builds at the root. `only` limits them, e.g. to the prefixed locales.
 */
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

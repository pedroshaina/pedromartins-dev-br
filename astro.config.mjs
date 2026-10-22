// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { defaultLocale, languageTag, locales } from './src/i18n/locales';
import night from './src/styles/shiki-night.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://pedromartins.dev.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Scoped styles add no specificity, so global hover/focus rules win over components' link colours.
  scopedStyleStrategy: 'where',
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale, locales: languageTag },
      // 404 pages answer any address; they aren't pages to index.
      filter: (page) => !/\/404(\.html|\/)?$/.test(new URL(page).pathname),
    }),
  ],
  markdown: {
    // @ts-expect-error the JSON import is a valid TextMate theme; its literal types are just wider
    shikiConfig: { theme: night },
  },
});

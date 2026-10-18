// @ts-check
import { defineConfig } from 'astro/config';
import night from './src/styles/shiki-night.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://portfolio.pdrlabs.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Scoped styles add no specificity, so global hover/focus rules win over components' link colours.
  scopedStyleStrategy: 'where',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // @ts-expect-error the JSON import is a valid TextMate theme; its literal types are just wider
    shikiConfig: { theme: night },
  },
});

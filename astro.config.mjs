// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://portfolio.pdrlabs.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});

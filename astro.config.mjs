import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daily-news.pages.dev',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});

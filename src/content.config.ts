import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { frontmatterSchema } from '@daily-news/shared';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './news' }),
  schema: frontmatterSchema,
});

export const collections = { news };

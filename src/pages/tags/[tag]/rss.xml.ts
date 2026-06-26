import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
  const all = await getCollection('news');
  const tags = new Set<string>();
  for (const e of all) for (const t of e.data.tags) tags.add(t);
  return [...tags].map((tag) => ({ params: { tag } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async (context) => {
  const tag = context.params.tag;
  if (!tag) return new Response('not found', { status: 404 });

  const items = (await getCollection('news'))
    .filter((e) => e.data.tags.includes(tag))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `#${tag} · 每日资讯`,
    description: `标签「${tag}」的文章`,
    site: context.site ?? 'https://daily-news.pages.dev',
    items: items.map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      link: `/news/${e.id}/`,
      categories: e.data.tags,
    })),
  });
};

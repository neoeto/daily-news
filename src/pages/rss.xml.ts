import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const recent = (await getCollection('news'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 50);

  return rss({
    title: '每日资讯',
    description: '个人资讯聚合',
    site: context.site ?? 'https://daily-news.pages.dev',
    items: recent.map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      link: `/news/${e.id}/`,
      categories: e.data.tags,
    })),
  });
};

import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 30_000,
  headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
});

export interface RawFeedItem {
  title: string;
  link: string;
  date: Date | null;
  /** Feed-provided body HTML, when the feed carries full content. Null when only a link is available. */
  contentHtml: string | null;
}

export interface ParsedFeed {
  items: RawFeedItem[];
  language: string | null;
  title: string | null;
}

export async function parseFeed(xml: string): Promise<ParsedFeed> {
  const feed = await parser.parseString(xml);
  const items: RawFeedItem[] = (feed.items ?? [])
    .map((item) => {
      const encoded = (item as Record<string, unknown>)['content:encoded'];
      const content =
        (typeof encoded === 'string' && encoded) ||
        (typeof item.content === 'string' && item.content) ||
        (typeof item.summary === 'string' && item.summary) ||
        '';
      const dateSrc = item.isoDate ?? item.pubDate;
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        date: dateSrc ? new Date(dateSrc) : null,
        contentHtml: content.trim() ? content : null,
      };
    })
    .filter((it) => it.link);
  return {
    items,
    language: feed.language ?? null,
    title: feed.title ?? null,
  };
}

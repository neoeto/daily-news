import type { Source, SourceStateEntry } from '@daily-news/shared';
import { fetchUrl, type FetchResult } from '../fetch';
import { extractReadable } from '../extract';
import { parseFeed } from './rss';
export interface RawItem {
  title: string;
  url: string;
  date: Date;
  /** Feed-provided body HTML, or null when only a link is available (orchestrator fetches it). */
  contentHtml: string | null;
  source: Source;
}

export class SourceFetchError extends Error {
  readonly sourceName: string;
  constructor(sourceName: string, message: string) {
    super(message);
    this.name = 'SourceFetchError';
    this.sourceName = sourceName;
  }
}

function newState(res: FetchResult): SourceStateEntry {
  const entry: SourceStateEntry = { last_fetched: new Date().toISOString() };
  if (res.etag) entry.etag = res.etag;
  if (res.lastModified) entry.last_modified = res.lastModified;
  return entry;
}

export interface CollectedSource {
  items: RawItem[];
  state: SourceStateEntry | undefined;
}

export async function collectRawItems(
  source: Source,
  state?: SourceStateEntry,
): Promise<CollectedSource> {
  const res = await fetchUrl(source.url, state ? { state } : {});
  if (res.networkError)
    throw new SourceFetchError(source.name, `network error fetching ${source.url}`);
  if (res.notModified) return { items: [], state };
  if (!res.ok) throw new SourceFetchError(source.name, `HTTP ${res.status} for ${source.url}`);

  if (source.type === 'rss') {
    const { items: feedItems } = await parseFeed(res.body);
    return {
      items: feedItems.map((fi) => ({
        title: fi.title,
        url: fi.link,
        date: fi.date ?? new Date(),
        contentHtml: fi.contentHtml,
        source,
      })),
      state: newState(res),
    };
  }

  if (source.type === 'html') {
    const ext = extractReadable(res.body, res.finalUrl, source);
    return {
      items: [
        {
          title: ext.title ?? source.name,
          url: res.finalUrl,
          date: new Date(),
          contentHtml: ext.bodyHtml || null,
          source,
        },
      ],
      state: newState(res),
    };
  }

  console.warn(
    `[router] source "${source.name}": type "${source.type}" not yet supported, skipping`,
  );
  return { items: [], state: newState(res) };
}

/**
 * HTTP fetch wrapper: custom UA, timeout, retry with exponential backoff,
 * redirect following. Built on Node 22 global fetch.
 */
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import type { SourceStateEntry } from '@daily-news/shared';

// Node's global fetch (undici) ignores http_proxy/https_proxy env vars.
// Route through ProxyAgent when a proxy is configured (local dev behind GFW).
const proxyUrl =
  process.env.https_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.http_proxy ||
  process.env.HTTP_PROXY;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; daily-news-crawler/0.1; +https://github.com/daily-news)';

export interface FetchOptions {
  timeoutMs?: number;
  maxRetries?: number;
  /** Conditional request headers (ETag / Last-Modified) for bandwidth savings. */
  state?: SourceStateEntry;
}

export interface FetchResult {
  ok: boolean;
  status: number;
  /** Response body text (empty on 304 / error). */
  body: string;
  /** Content-Type header (lowercased). */
  contentType: string;
  /** ETag from response, if any (for caching next run). */
  etag: string | undefined;
  lastModified: string | undefined;
  /** Final URL after redirects. */
  finalUrl: string;
  /** True when the source returned 304 Not Modified (skip processing). */
  notModified: boolean;
  /** True when the request failed at the network layer (no HTTP response). */
  networkError: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchUrl(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  const { timeoutMs = 60_000, maxRetries = 3, state } = opts;
  const headers: Record<string, string> = {
    'user-agent': USER_AGENT,
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
  };
  if (state?.etag) headers['if-none-match'] = state.etag;
  if (state?.last_modified) headers['if-modified-since'] = state.last_modified;

  let attempt = 0;
  let lastError: unknown;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
      clearTimeout(timer);

      const status = res.status;
      const notModified = status === 304;
      const body = notModified || !res.ok ? '' : await res.text();
      const ct = (res.headers.get('content-type') ?? '').toLowerCase();

      // Retry on 429 / 5xx.
      if ((status === 429 || status >= 500) && attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** attempt, 30_000);
        await sleep(backoff);
        attempt++;
        continue;
      }

      return {
        ok: res.ok,
        status,
        body,
        contentType: ct,
        etag: res.headers.get('etag') ?? undefined,
        lastModified: res.headers.get('last-modified') ?? undefined,
        finalUrl: res.url || url,
        notModified,
        networkError: false,
      };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < maxRetries) {
        const backoff = Math.min(1000 * 2 ** attempt, 20_000);
        await sleep(backoff);
        attempt++;
        continue;
      }
      break;
    }
  }

  return {
    ok: false,
    status: 0,
    body: '',
    contentType: '',
    etag: undefined,
    lastModified: undefined,
    finalUrl: url,
    notModified: false,
    networkError: true,
  };
}

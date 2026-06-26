import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import type { Source } from '@daily-news/shared';

const NOISE_SELECTORS =
  '.related, .newsletter, .paywall, .promo, .share, .comments, .ad, .ads, [role="complementary"], aside, nav, footer, header';

const MIN_BODY_CHARS = 200;

export interface Extracted {
  title: string | null;
  bodyHtml: string;
  truncated: boolean;
}

export function extractReadable(html: string, url: string, source?: Source): Extracted {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  doc.querySelectorAll(NOISE_SELECTORS).forEach((el) => el.remove());

  const overrideBody = source?.selectors?.body;
  if (overrideBody) {
    const node = doc.querySelector(overrideBody);
    const bodyHtml = node ? node.innerHTML : '';
    const titleNode = source?.selectors?.title ? doc.querySelector(source.selectors.title) : null;
    const title = titleNode?.textContent?.trim() ?? doc.title ?? null;
    return { title, bodyHtml, truncated: (node?.textContent ?? '').trim().length < MIN_BODY_CHARS };
  }

  try {
    const article = new Readability(doc).parse();
    if (!article) return { title: doc.title ?? null, bodyHtml: '', truncated: true };
    return {
      title: article.title ?? null,
      bodyHtml: article.content ?? '',
      truncated: (article.length ?? 0) < MIN_BODY_CHARS,
    };
  } catch {
    return { title: doc.title ?? null, bodyHtml: '', truncated: true };
  }
}

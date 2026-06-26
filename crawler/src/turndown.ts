import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const KEEP_RAW_HTML: Array<keyof HTMLElementTagNameMap> = [
  'iframe',
  'figure',
  'figcaption',
  'video',
  'audio',
  'source',
];

const service = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  linkStyle: 'inlined',
});
service.use(gfm);
service.keep(KEEP_RAW_HTML);

/** Convert extracted article HTML to normalized Markdown. Images stay hotlinked. */
export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';
  const md = service.turndown(html);
  return md
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

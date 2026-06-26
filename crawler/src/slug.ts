/**
 * Slug generation for news/<date>-<slug>.md filenames.
 * ASCII-friendly; falls back to a short hash for CJK-only titles.
 */
import { createHash } from 'node:crypto';

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  if (base.length >= 4) return base;

  // Title had little/no ASCII (e.g. pure CJK): derive a short stable hash.
  return 'a' + createHash('sha1').update(title).digest('hex').slice(0, 10);
}

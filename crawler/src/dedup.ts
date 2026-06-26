/**
 * Content-addressed deduplication (design D11).
 *
 * url_hash = sha1(canonicalize(url)). The "seen" set is DERIVED from
 * news/*.md frontmatter — no separate state file. File existence == processed.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'ref_src',
  'mc_cid',
  'mc_eid',
]);

/** Normalize a URL so equivalent URLs hash identically. */
export function canonicalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) u.searchParams.delete(key);
    }
    u.searchParams.sort();
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.replace(/\/+$/, '');
    }
    return u.toString();
  } catch {
    return raw.trim();
  }
}

export function urlHash(rawUrl: string): string {
  return createHash('sha1').update(canonicalizeUrl(rawUrl)).digest('hex');
}

/** Scan news/*.md frontmatter and collect every url_hash already stored. */
export async function loadSeenHashes(newsDir: string): Promise<Set<string>> {
  let files: string[];
  try {
    files = await readdir(newsDir);
  } catch {
    return new Set();
  }

  const hashes = new Set<string>();
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    try {
      const raw = await readFile(path.join(newsDir, file), 'utf8');
      const fm = matter(raw).data;
      if (typeof fm.url_hash === 'string') hashes.add(fm.url_hash);
    } catch {
      // Skip unparseable files rather than failing the whole scan.
    }
  }
  return hashes;
}

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { frontmatterSchema, type Frontmatter } from '@daily-news/shared';
import { slugify } from './slug';

async function pathExists(p: string): Promise<boolean> {
  try {
    await readFile(p);
    return true;
  } catch {
    return false;
  }
}

/** Write a validated article to news/<date>-<slug>.md, de-conflicting on collision. */
export async function writeArticle(
  fm: Frontmatter,
  body: string,
  newsDir: string,
): Promise<string> {
  const validated = frontmatterSchema.parse(fm);
  const dateStr = validated.date.toISOString().slice(0, 10);
  const slug = slugify(validated.title);
  const hash8 = validated.url_hash.slice(0, 8);

  let filename = `${dateStr}-${slug}.md`;
  if (await pathExists(path.join(newsDir, filename))) {
    filename = `${dateStr}-${slug}-${hash8}.md`;
  }
  const filepath = path.join(newsDir, filename);
  const content = matter.stringify(`${body.trim()}\n`, validated);
  await writeFile(filepath, content, 'utf8');
  return filepath;
}

import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { pathToFileURL } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { franc } from 'franc';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { fetchUrl } from '@daily-news/crawler/fetch';
import { parseFeed, type RawFeedItem } from '@daily-news/crawler/sources/rss';
import { extractReadable } from '@daily-news/crawler/extract';
import { htmlToMarkdown } from '@daily-news/crawler/turndown';
import { sourceSchema, sourcesConfigSchema, type Source } from '@daily-news/shared';

const SOURCES_PATH = path.resolve(process.cwd(), 'configs/sources.yaml');

const FRANC_6393: Record<string, string> = {
  cmn: 'zh',
  yue: 'zh',
  eng: 'en',
  jpn: 'ja',
  kor: 'ko',
};

export function normalizeLang(raw: string | null): string {
  if (!raw) return 'und';
  const lower = raw.toLowerCase();
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ko')) return 'ko';
  return FRANC_6393[lower] ?? lower.slice(0, 2);
}

function detectLang(text: string): string {
  const clean = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length < 12) return 'und';
  return normalizeLang(franc(clean, { minLength: 12 }));
}

export function sniffType(contentType: string, body: string): 'rss' | 'html' {
  if (/rss|atom|xml/i.test(contentType)) return 'rss';
  if (/<\?xml|<rss|<feed[\s>]/i.test(body.slice(0, 1000))) return 'rss';
  return 'html';
}

export function discoverFeedUrl(html: string, baseUrl: string): string | null {
  const match = html.match(
    /<link[^>]*rel=["']alternate["'][^>]*(?:type=["'][^"']*(?:rss|atom)[^"']*["'])[^>]*>/i,
  );
  const node = match?.[0];
  if (!node) return null;
  const href = node.match(/href=["']([^"']+)["']/i)?.[1];
  if (!href) return null;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

async function appendSource(entry: Source): Promise<void> {
  const raw = await readFile(SOURCES_PATH, 'utf8');
  const doc = sourcesConfigSchema.parse(parseYaml(raw));
  const next = { ...doc, sources: [...doc.sources, entry] };
  sourcesConfigSchema.parse(next);
  await writeFile(SOURCES_PATH, stringifyYaml(next), 'utf8');
}

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error('用法: pnpm add-source <url>');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ask = async (q: string): Promise<string> => {
    try {
      return await rl.question(q);
    } catch {
      return '';
    }
  };

  console.log(`\n🔍 探测 ${url}`);
  const res = await fetchUrl(url);
  if (!res.ok || !res.body) {
    console.error(`✗ 抓取失败 (status ${res.status})`);
    rl.close();
    process.exit(1);
  }

  let type = sniffType(res.contentType, res.body);
  let feedUrl = url;
  let feedBody = res.body;

  if (type === 'html') {
    const discovered = discoverFeedUrl(res.body, url);
    if (discovered) {
      console.log(`  ✓ 发现 feed: ${discovered}`);
      const fr = await fetchUrl(discovered);
      if (fr.ok && fr.body) {
        try {
          const trial = await parseFeed(fr.body);
          if (trial.items.length > 0) {
            feedUrl = discovered;
            feedBody = fr.body;
            type = 'rss';
          }
        } catch {}
      }
    }
  }
  console.log(`  类型: ${type}`);

  let lang = 'und';
  let name = url;
  let latest: RawFeedItem | null = null;
  let previewTitle = name;
  let previewMd = '';
  let readabilityOk = true;

  if (type === 'rss') {
    const feed = await parseFeed(feedBody);
    lang = normalizeLang(feed.language);
    name = feed.title ?? new URL(feedUrl).hostname;
    latest = feed.items[0] ?? null;
    previewTitle = latest?.title || name;
    let bodyHtml = latest?.contentHtml ?? '';
    if (latest && !bodyHtml && latest.link) {
      const art = await fetchUrl(latest.link);
      if (art.ok && art.body) {
        const ext = extractReadable(art.body, latest.link);
        bodyHtml = ext.bodyHtml;
        if (!ext.bodyHtml || ext.truncated) readabilityOk = false;
      }
    }
    previewMd = bodyHtml ? htmlToMarkdown(bodyHtml) : '';
    if (lang === 'und') lang = detectLang(`${previewTitle} ${previewMd}`);
  } else {
    name = new URL(res.finalUrl).hostname;
    const ext = extractReadable(res.body, res.finalUrl);
    previewTitle = ext.title ?? name;
    previewMd = ext.bodyHtml ? htmlToMarkdown(ext.bodyHtml) : '';
    if (!ext.bodyHtml || ext.truncated) readabilityOk = false;
    lang = detectLang(`${previewTitle} ${previewMd}`);
  }

  console.log(`  语言: ${lang}`);
  console.log(`  名称: ${name}`);

  if (previewMd.trim()) {
    console.log('\n📝 最新一篇预览:');
    console.log(`  标题: ${previewTitle}`);
    console.log('  ─────────────');
    console.log(previewMd.slice(0, 500).replace(/^/gm, '  '));
    if (previewMd.length > 500) console.log('  …(截断预览)');
    console.log('  ─────────────');
  } else {
    console.log('\n⚠ 未能提取正文(可能 SPA / 付费墙 / Readability 失败)');
  }

  const entryUrl = type === 'rss' ? feedUrl : res.finalUrl;
  let entry: Source;
  if (!readabilityOk && type === 'html') {
    const sel = (await ask('\n正文提取为空/过短,指定 body CSS 选择器?(留空跳过) ')).trim();
    entry = {
      name,
      url: entryUrl,
      type,
      lang,
      ...(sel ? { selectors: { body: sel } } : {}),
    };
  } else {
    entry = {
      name,
      url: entryUrl,
      type,
      lang,
    };
  }
  sourceSchema.parse(entry);

  console.log('\n✅ 生成 sources.yaml 条目:');
  console.log(
    stringifyYaml([{ ...entry }])
      .replace(/^---\n/, '')
      .trim(),
  );

  const ans = (await ask('\n追加到 configs/sources.yaml? [y/N] ')).trim().toLowerCase();
  if (ans === 'y' || ans === 'yes') {
    await appendSource(entry);
    console.log('✓ 已追加。git commit & push 后下次 cron 生效。');
  } else {
    console.log('已取消,未修改 sources.yaml。');
  }
  rl.close();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error('[add-source] 错误:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

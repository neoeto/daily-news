import path from 'node:path';
import { loadLlmConfig, loadSourceState, loadSourcesConfig, loadTagsRegistry } from './config';
import { createLlmGateway, type LlmGateway } from './llm';
import { loadSeenHashes, urlHash } from './dedup';
import { collectRawItems, type RawItem } from './sources/router';
import { extractReadable } from './extract';
import { htmlToMarkdown } from './turndown';
import { translateBody } from './translate';
import { tagArticle } from './tag';
import { writeArticle } from './write';
import { saveSourceState } from './state';
import { saveRunSummary } from './summary';
import { fetchUrl } from './fetch';
import type { FailureEntry, Frontmatter, SourceRunResult, SourceState } from '@daily-news/shared';

const NEWS_DIR = path.resolve(process.cwd(), 'news');

function excerpt(text: string, max = 800): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function main(): Promise<void> {
  const startedAt = new Date();
  const date = startedAt.toISOString().slice(0, 10);
  console.log(`[crawl] start ${date}`);

  const sourcesConfig = await loadSourcesConfig();
  const llmConfig = await loadLlmConfig();
  const tagsRegistry = await loadTagsRegistry();
  const sourceState: SourceState = await loadSourceState();

  const gateway: LlmGateway = createLlmGateway(llmConfig);
  const seen = await loadSeenHashes(NEWS_DIR);
  console.log(
    `[crawl] ${sourcesConfig.sources.length} sources, ${seen.size} existing articles, llm=${gateway.available}`,
  );

  const targetLang = sourcesConfig.target_lang;
  const sourceResults: SourceRunResult[] = [];
  const failures: FailureEntry[] = [];
  let totalWritten = 0;
  let totalSkippedDup = 0;

  for (const source of sourcesConfig.sources) {
    const prevState = sourceState[source.name];
    let items: RawItem[] = [];
    let fetched = 0;
    let written = 0;
    let translatedCount = 0;
    let sourceError: string | undefined;

    try {
      const collected = await collectRawItems(source, prevState);
      items = collected.items;
      fetched = items.length;
      if (collected.state) sourceState[source.name] = collected.state;
    } catch (err) {
      sourceError = err instanceof Error ? err.message : String(err);
      console.warn(`[crawl] source "${source.name}" failed: ${sourceError}`);
      sourceResults.push({
        source: source.name,
        items_fetched: 0,
        items_written: 0,
        translated: 0,
        ...(sourceError ? { error: sourceError } : {}),
      });
      continue;
    }

    for (const item of items) {
      const hash = urlHash(item.url);
      if (seen.has(hash)) {
        totalSkippedDup++;
        continue;
      }

      try {
        let bodyHtml = item.contentHtml ?? '';
        let truncated = false;
        let title = item.title;

        if (!bodyHtml) {
          const art = await fetchUrl(item.url);
          if (!art.ok || !art.body) {
            failures.push({ url: item.url, stage: 'fetch', error: `HTTP ${art.status}` });
            continue;
          }
          const ext = extractReadable(art.body, item.url, source);
          bodyHtml = ext.bodyHtml;
          truncated = ext.truncated;
          if (!title && ext.title) title = ext.title;
        }

        let bodyMd = htmlToMarkdown(bodyHtml);
        if (!bodyMd.trim()) {
          failures.push({ url: item.url, stage: 'extract', error: 'empty body after conversion' });
          continue;
        }

        let translated = false;
        let originalLang: string | undefined;
        let lang = source.lang;
        if (source.lang !== targetLang && gateway.available && !gateway.budgetExceeded) {
          const translatedMd = await translateBody(
            gateway,
            bodyMd,
            source.lang,
            targetLang,
            llmConfig.llm.translate.model,
            llmConfig.llm.translate.temperature,
          );
          if (translatedMd.trim()) {
            bodyMd = translatedMd;
            translated = true;
            originalLang = source.lang;
            lang = targetLang;
            translatedCount++;
          }
        }

        let tags: string[] = [];
        if (gateway.available && !gateway.budgetExceeded) {
          try {
            tags = await tagArticle(
              gateway,
              tagsRegistry,
              llmConfig.llm.tag.max_tags,
              llmConfig.llm.tag.model,
              llmConfig.llm.tag.temperature,
              title,
              excerpt(bodyMd),
            );
          } catch (tagErr) {
            failures.push({
              url: item.url,
              stage: 'tag',
              error: tagErr instanceof Error ? tagErr.message : String(tagErr),
            });
          }
        }

        const fm: Frontmatter = {
          title,
          url: item.url,
          url_hash: hash,
          source: source.name,
          source_url: source.url,
          date: item.date,
          lang,
          translated,
          tags,
          truncated,
          ...(originalLang ? { original_lang: originalLang } : {}),
        };

        await writeArticle(fm, bodyMd, NEWS_DIR);
        seen.add(hash);
        written++;
        totalWritten++;
        console.log(`[crawl] + ${source.name}: ${title.slice(0, 60)}`);

        if (gateway.budgetExceeded) {
          console.warn(`[crawl] token budget exceeded (${gateway.usedTokens}); stopping`);
          break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        failures.push({ url: item.url, stage: 'write', error: msg });
        console.warn(`[crawl] item failed (${item.url}): ${msg}`);
      }
    }

    sourceResults.push({
      source: source.name,
      items_fetched: fetched,
      items_written: written,
      translated: translatedCount,
      ...(sourceError ? { error: sourceError } : {}),
    });

    if (gateway.budgetExceeded) break;
  }

  try {
    await saveSourceState(sourceState);
  } catch (err) {
    console.warn(
      `[crawl] failed to save source state: ${err instanceof Error ? err.message : err}`,
    );
  }

  const finishedAt = new Date();
  try {
    await saveRunSummary({
      date,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      total_written: totalWritten,
      total_skipped_dup: totalSkippedDup,
      total_tokens: gateway.usedTokens,
      budget_exceeded: gateway.budgetExceeded,
      sources: sourceResults,
      failures,
    });
  } catch (err) {
    console.warn(`[crawl] failed to save run summary: ${err instanceof Error ? err.message : err}`);
  }

  console.log(
    `[crawl] done: wrote ${totalWritten}, skipped ${totalSkippedDup} dups, ${failures.length} failures, ${gateway.usedTokens} tokens${gateway.budgetExceeded ? ' [BUDGET EXCEEDED]' : ''}`,
  );
}

main().catch((err) => {
  console.error('[crawl] fatal:', err);
  process.exit(1);
});

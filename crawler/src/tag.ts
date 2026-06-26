import type { TagsRegistry } from '@daily-news/shared';
import type { LlmGateway, ChatMessage } from './llm';

export function buildAliasMap(registry: TagsRegistry): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, aliases] of Object.entries(registry)) {
    map.set(canonical, canonical);
    map.set(canonical.toLowerCase(), canonical);
    for (const alias of aliases) {
      map.set(alias, canonical);
      map.set(alias.toLowerCase(), canonical);
    }
  }
  return map;
}

export function normalizeTags(raw: string[], aliasMap: Map<string, string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of raw) {
    const t = tag.trim();
    if (!t) continue;
    const canonical = aliasMap.get(t) ?? aliasMap.get(t.toLowerCase()) ?? t;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      out.push(canonical);
    }
  }
  return out;
}

function parseTagJson(content: string): string[] {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function tagPrompt(
  maxTags: number,
  canonicalList: string[],
  title: string,
  excerpt: string,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        `You are a content tagger. Assign at most ${maxTags} tags to the article.`,
        'Prefer REUSING tags from the existing list when any fits.',
        'Only propose a NEW tag if no existing one is a good match.',
        'Respond with ONLY a JSON array of tag strings, no prose.',
      ].join(' '),
    },
    {
      role: 'user',
      content: `Existing tags: ${JSON.stringify(canonicalList)}\n\nTitle: ${title}\n\nExcerpt:\n${excerpt}`,
    },
  ];
}

export async function tagArticle(
  gateway: LlmGateway,
  registry: TagsRegistry,
  maxTags: number,
  model: string,
  temperature: number,
  title: string,
  excerpt: string,
): Promise<string[]> {
  const canonicalList = Object.keys(registry);
  const messages = tagPrompt(maxTags, canonicalList, title, excerpt);
  const { content } = await gateway.chat(model, temperature, messages);
  return normalizeTags(parseTagJson(content), buildAliasMap(registry)).slice(0, maxTags);
}

/**
 * Configuration loading & validation.
 *
 * Reads configs/{sources,llm.config}.yaml + tags.json + source-state.yaml,
 * substitutes ${VAR} env placeholders, and validates everything through the
 * shared Zod schemas. Persists only git files — no DB (design D3).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  llmConfigSchema,
  sourceStateSchema,
  sourcesConfigSchema,
  tagsRegistrySchema,
  type LlmConfig,
  type SourceState,
  type SourcesConfig,
  type TagsRegistry,
} from '@daily-news/shared';

const CONFIG_DIR = path.resolve(process.cwd(), 'configs');

/** Replace ${VAR} or ${VAR:-default} placeholders in a raw string with process.env[VAR]. */
export function substituteEnv(raw: string): string {
  return raw.replace(/\$\{(\w+)(?::-(.*?))?\}/g, (_match, name: string, def?: string) => {
    const val = process.env[name];
    return val && val.length > 0 ? val : (def ?? '');
  });
}

async function readYaml(file: string): Promise<string> {
  return readFile(path.join(CONFIG_DIR, file), 'utf8');
}

export async function loadSourcesConfig(): Promise<SourcesConfig> {
  const raw = await readYaml('sources.yaml');
  const parsed = sourcesConfigSchema.parse(parseYaml(raw));
  return parsed;
}

export async function loadLlmConfig(): Promise<LlmConfig> {
  const raw = substituteEnv(await readYaml('llm.config.yaml'));
  const parsed = llmConfigSchema.parse(parseYaml(raw));
  return parsed;
}

export async function loadTagsRegistry(): Promise<TagsRegistry> {
  const raw = await readFile(path.join(CONFIG_DIR, 'tags.json'), 'utf8');
  return tagsRegistrySchema.parse(JSON.parse(raw));
}

export async function loadSourceState(): Promise<SourceState> {
  try {
    const raw = await readYaml('source-state.yaml');
    return sourceStateSchema.parse(parseYaml(raw));
  } catch {
    // Missing or invalid state is non-fatal — just refetch everything.
    return {};
  }
}

// Minimal YAML parser via the `yaml` package (already a crawler dep).
import { parse as parseYaml } from 'yaml';

export const CONFIG_PATHS = {
  sources: path.join(CONFIG_DIR, 'sources.yaml'),
  llm: path.join(CONFIG_DIR, 'llm.config.yaml'),
  tags: path.join(CONFIG_DIR, 'tags.json'),
  sourceState: path.join(CONFIG_DIR, 'source-state.yaml'),
} as const;

/**
 * Shared Zod schemas — the contract between the crawler (GitHub Actions)
 * and the Astro site (Cloudflare Pages build). Both sides import from here,
 * so frontmatter / config field definitions cannot drift.
 */
import { z } from 'zod';

// ===========================================================================
// news/*.md frontmatter — the article content contract
// ===========================================================================

/** ISO language code used per-source and as translation target (e.g. 'zh', 'en'). */
export const langCodeSchema = z.string().min(2);

export const frontmatterSchema = z.object({
  /** Article title (translated if translation applied). */
  title: z.string(),
  /** Canonical URL of the original article. */
  url: z.string().url(),
  /** sha1 of the canonicalized URL — dedup key. */
  url_hash: z.string(),
  /** Display name of the source (from sources.yaml `name`). */
  source: z.string(),
  /** Home URL of the source. */
  source_url: z.string().url(),
  /** Publish date of the article. */
  date: z.coerce.date(),
  /** Final language of the stored body (after translation, if any). */
  lang: langCodeSchema,
  /** Whether the body was machine-translated. */
  translated: z.boolean().default(false),
  /** Canonical tags after alias normalization. */
  tags: z.array(z.string()).default([]),
  /** Original language before translation (only when translated). */
  original_lang: langCodeSchema.optional(),
  /** True when extracted body was suspiciously short (SPA stub / paywall). */
  truncated: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

// ===========================================================================
// sources.yaml — content source declarations
// ===========================================================================

export const sourceTypeSchema = z.enum(['rss', 'api', 'html']);
export type SourceType = z.infer<typeof sourceTypeSchema>;

/** Per-source CSS-selector overrides for when Readability fails. */
export const selectorsSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  date: z.string().optional(),
});
export type Selectors = z.infer<typeof selectorsSchema>;

export const sourceSchema = z.object({
  name: z.string(),
  /** Feed URL (rss/api) or page URL (html). */
  url: z.string().url(),
  type: sourceTypeSchema,
  /** Declared language of this source's content (drives translate-skip). */
  lang: langCodeSchema,
  selectors: selectorsSchema.optional(),
  /**
   * Max NEW articles to process per run for this source (counted after
   * url_hash dedup, before entering the fetch→extract→translate→tag pipeline).
   * Omit = unlimited. Remaining candidates are deferred to the next run
   * (their url_hash is never written until actually processed).
   */
  max_items: z.number().int().positive().optional(),
});
export type Source = z.infer<typeof sourceSchema>;

export const sourcesConfigSchema = z.object({
  /** Target language to translate foreign content into. */
  target_lang: langCodeSchema.default('zh'),
  sources: z.array(sourceSchema),
});
export type SourcesConfig = z.infer<typeof sourcesConfigSchema>;

// ===========================================================================
// llm.config.yaml — OpenAI-compatible LLM settings
// ===========================================================================

/**
 * String field sourced from an env-injected ${VAR}. YAML renders an empty
 * value as null; normalize null/undefined → '' so "no key" == gateway off.
 */
const envString = z.preprocess((v) => (v == null ? '' : v), z.string());

export const llmConfigSchema = z.object({
  llm: z.object({
    /** OpenAI-compatible endpoint base URL (env-injected). */
    base_url: envString,
    /** API key (env-injected, never committed). Empty means gateway disabled. */
    api_key: envString,
    request: z.object({
      timeout: z.number().default(60_000),
      max_retries: z.number().default(3),
    }),
    translate: z.object({
      model: z.string(),
      temperature: z.number().default(0.3),
    }),
    tag: z.object({
      model: z.string(),
      temperature: z.number().default(0.2),
      max_tags: z.number().default(5),
    }),
    guardrails: z.object({
      /** Hard cap on cumulative LLM tokens per run; excess stops processing. */
      max_tokens_per_run: z.number().default(500_000),
    }),
  }),
});
export type LlmConfig = z.infer<typeof llmConfigSchema>;

// ===========================================================================
// tags.json — canonical tag → alias[] registry
// ===========================================================================

/** Maps a canonical tag name to its accepted variant aliases. */
export const tagsRegistrySchema = z.record(z.string(), z.array(z.string()));
export type TagsRegistry = z.infer<typeof tagsRegistrySchema>;

// ===========================================================================
// source-state.yaml — per-source incremental fetch cursors (bandwidth opt)
// ===========================================================================

export const sourceStateEntrySchema = z.object({
  etag: z.string().optional(),
  last_modified: z.string().optional(),
  last_fetched: z.string().optional(),
});
export type SourceStateEntry = z.infer<typeof sourceStateEntrySchema>;

export const sourceStateSchema = z.record(z.string(), sourceStateEntrySchema);
export type SourceState = z.infer<typeof sourceStateSchema>;

// ===========================================================================
// runs/<date>.json — per-run summary (append-only, for observability)
// ===========================================================================

export const sourceRunResultSchema = z.object({
  source: z.string(),
  items_fetched: z.number(),
  items_written: z.number(),
  translated: z.number(),
  error: z.string().optional(),
});
export type SourceRunResult = z.infer<typeof sourceRunResultSchema>;

export const failureEntrySchema = z.object({
  url: z.string(),
  /** Pipeline stage where the failure occurred. */
  stage: z.enum(['fetch', 'extract', 'translate', 'tag', 'write']),
  error: z.string(),
});
export type FailureEntry = z.infer<typeof failureEntrySchema>;

export const runSummarySchema = z.object({
  date: z.string(),
  started_at: z.string(),
  finished_at: z.string(),
  total_written: z.number(),
  total_skipped_dup: z.number(),
  total_tokens: z.number(),
  budget_exceeded: z.boolean().default(false),
  sources: z.array(sourceRunResultSchema),
  failures: z.array(failureEntrySchema),
});
export type RunSummary = z.infer<typeof runSummarySchema>;

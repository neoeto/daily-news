/**
 * Shared reading-state schema — the contract for client-side reading state
 * persisted in the browser's localStorage. Consumed by the Astro site
 * (src/scripts/reading-state.ts store) and unit-tested here in Node.
 *
 * Design rationale: see openspec/changes/add-reading-state/design.md (D2, D3).
 * Key choices:
 *   - Keyed by `url_hash` (sha1 of canonical URL) — stable across title edits
 *     and aligned with the crawler's dedup identity.
 *   - Envelope `{ v, data }` with version embedded in the storage key —
 *     supports future schema migrations without overwriting old data.
 *   - Pure functions only — no DOM, no localStorage, no I/O. The browser
 *     adapter lives in src/scripts/reading-state.ts (Phase 2).
 */
import { z } from 'zod';

// ===========================================================================
// Constants
// ===========================================================================

/** Current schema version. Bump when the data shape changes; add a migration to MIGRATIONS. */
export const READING_STATE_VERSION = 1;

/** localStorage key. Version is embedded so old + new data can coexist during rollout. */
export const READING_STATE_STORAGE_KEY = `dn:state:v${READING_STATE_VERSION}`;

// ===========================================================================
// State shape
// ===========================================================================

/** Per-read-article metadata. `at` is epoch milliseconds; `y` is scrollY pixels at time of read. */
const readEntrySchema = z.object({
  at: z.number(),
  y: z.number(),
});

/** Per-starred-article metadata. `at` is epoch milliseconds (starredAt). */
const starredEntrySchema = z.object({
  at: z.number(),
});

/** The user's reading state — two maps keyed by url_hash. */
export const readingStateDataSchema = z.object({
  read: z.record(z.string(), readEntrySchema),
  starred: z.record(z.string(), starredEntrySchema),
});

/**
 * Versioned envelope persisted to localStorage under `READING_STATE_STORAGE_KEY`.
 * `v` is a literal so any version drift invalidates the parse, forcing migration
 * (or reset to empty) on read.
 */
export const readingStateEnvelopeV1Schema = z.object({
  v: z.literal(READING_STATE_VERSION),
  data: readingStateDataSchema,
});

/** The reading-state data shape (the inside of the envelope). */
export type ReadingStateV1 = z.infer<typeof readingStateDataSchema>;

/** The full envelope persisted to localStorage. */
export type ReadingEnvelopeV1 = z.infer<typeof readingStateEnvelopeV1Schema>;

// ===========================================================================
// Pure utilities
// ===========================================================================

/** Returns a fresh empty reading state. Each call yields a new object (no shared refs). */
export function emptyState(): ReadingStateV1 {
  return { read: {}, starred: {} };
}

/** Sequential migration step: transforms the previous version's data into the next. */
type Migration = { fromVersion: number; migrate: (prev: unknown) => ReadingStateV1 };

/**
 * Ordered migrations. Empty in v1 — when v2 is introduced, append a step with
 * `fromVersion: 1` and keep the shape additive (don't remove fields without a
 * replacement plan).
 */
const MIGRATIONS: Migration[] = [];

/**
 * Migrate `raw` data from `fromVersion` up to `READING_STATE_VERSION`.
 *
 * Pure: no side effects, no I/O. Never throws — any error, unknown version, or
 * missing migration link returns `emptyState()`. Callers should persist the
 * result (and remove the old key) to complete the migration.
 *
 * In v1 there are no migrations, so any `fromVersion < 1` returns `emptyState()`
 * (the migration walk finds no step from version 0).
 */
export function migrate(raw: unknown, fromVersion: number): ReadingStateV1 {
  try {
    if (fromVersion >= READING_STATE_VERSION) {
      // No-op or downgrade — nothing to migrate.
      return emptyState();
    }
    let current: unknown = raw;
    let v = fromVersion;
    while (v < READING_STATE_VERSION) {
      const step = MIGRATIONS.find((m) => m.fromVersion === v);
      if (!step) {
        // Missing link in the migration chain — give up safely.
        return emptyState();
      }
      current = step.migrate(current);
      v += 1;
    }
    // Validate the migrated shape before handing it back.
    const parsed = readingStateDataSchema.safeParse(current);
    return parsed.success ? parsed.data : emptyState();
  } catch {
    return emptyState();
  }
}

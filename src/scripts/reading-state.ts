/**
 * Browser-side reading-state store — runtime companion to shared/reading-state.ts.
 *
 * Provides a small pub/sub store backed by localStorage, with an in-memory
 * fallback for private mode / quota exceeded / sandboxed iframes. All UI
 * subscribes via subscribe(); mutations happen only through the action
 * functions (markRead / unmarkRead / toggleStar / clearOrphans).
 *
 * Design: see openspec/changes/add-reading-state/design.md (D1, D3, D8, D9).
 *
 * Constraints:
 *   - Never throws. All localStorage access wrapped in try/catch.
 *   - In-memory Map fallback when localStorage is unavailable.
 *   - Single source of truth: this module's `state` variable.
 *   - Cross-tab sync via window 'storage' event (D9).
 *   - Browser-only. Top-level code only runs in browser context; build-time
 *     execution never reaches this module (Astro ships it as a client bundle).
 */
import {
  READING_STATE_STORAGE_KEY,
  emptyState,
  readingStateDataSchema,
  type ReadingStateV1,
} from '@daily-news/shared';

// ===========================================================================
// localStorage adapter with in-memory fallback
// ===========================================================================

const memoryFallback = new Map<string, string>();

/** Probe whether localStorage is actually writable (Safari private mode trap). */
function hasLocalStorage(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const probe = '__dn_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = typeof window !== 'undefined' && hasLocalStorage();

function safeGet(key: string): string | null {
  try {
    if (storageAvailable) return localStorage.getItem(key);
  } catch {
    // fall through to memory
  }
  return memoryFallback.get(key) ?? null;
}

function safeSet(key: string, value: string): boolean {
  try {
    if (storageAvailable) {
      localStorage.setItem(key, value);
      return true;
    }
    memoryFallback.set(key, value);
    return true;
  } catch (e) {
    // QuotaExceededError (Chrome/Safari) OR NS_ERROR_DOM_QUOTA_REACHED (Firefox)
    if (e instanceof DOMException) {
      const name = e.name;
      if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        // Existing data preserved; this write fails. Fall back to memory so the
        // current session still works (will be lost on reload — acceptable).
        memoryFallback.set(key, value);
        return true;
      }
    }
    memoryFallback.set(key, value);
    return true;
  }
}

function safeRemove(key: string): void {
  try {
    if (storageAvailable) localStorage.removeItem(key);
    memoryFallback.delete(key);
  } catch {
    memoryFallback.delete(key);
  }
}

// ===========================================================================
// State load/save (envelope shape: { v, data })
// ===========================================================================

function loadState(): ReadingStateV1 {
  const raw = safeGet(READING_STATE_STORAGE_KEY);
  if (raw === null) return emptyState();
  try {
    const parsed = JSON.parse(raw) as { data?: unknown };
    const result = readingStateDataSchema.safeParse(parsed?.data);
    return result.success ? result.data : emptyState();
  } catch {
    return emptyState();
  }
}

function saveState(s: ReadingStateV1): boolean {
  const envelope = JSON.stringify({ v: 1, data: s });
  return safeSet(READING_STATE_STORAGE_KEY, envelope);
}

// ===========================================================================
// Pub/sub store
// ===========================================================================

let state: ReadingStateV1 = loadState();
const subscribers = new Set<(s: ReadingStateV1) => void>();

function notify(): void {
  for (const fn of subscribers) {
    try {
      fn(state);
    } catch {
      // Subscriber failures don't break the store.
    }
  }
}

/** Returns the current state. The returned object is a reference — treat as read-only. */
export function getState(): ReadingStateV1 {
  return state;
}

/**
 * Subscribe to state changes. The listener is called immediately is NOT —
 * callers should read getState() right after subscribing to initialize.
 * Returns an unsubscribe function.
 */
export function subscribe(fn: (s: ReadingStateV1) => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** Internal: apply a new state, persist, and notify. */
function commit(next: ReadingStateV1): void {
  state = next;
  saveState(state);
  notify();
}

// ===========================================================================
// Actions
// ===========================================================================

/**
 * Mark an article as read. Idempotent: if already read at the same or higher
 * scrollY, this is a no-op. The `at` timestamp is preserved once set (the
 * original read time is meaningful for future features like "recently read");
 * only `y` advances as the user scrolls further.
 */
export function markRead(urlHash: string, opts: { y?: number } = {}): void {
  const existing = state.read[urlHash];
  const newY = opts.y ?? existing?.y ?? 0;
  if (existing && existing.y >= newY) return; // already read at same or later position
  commit({
    ...state,
    read: {
      ...state.read,
      [urlHash]: { at: existing?.at ?? Date.now(), y: newY },
    },
  });
}

/** Remove an article from the read map. No-op if not currently read. */
export function unmarkRead(urlHash: string): void {
  if (!(urlHash in state.read)) return;
  const nextRead = { ...state.read };
  delete nextRead[urlHash];
  commit({ ...state, read: nextRead });
}

/** Toggle the starred state of an article. */
export function toggleStar(urlHash: string): void {
  if (urlHash in state.starred) {
    const nextStarred = { ...state.starred };
    delete nextStarred[urlHash];
    commit({ ...state, starred: nextStarred });
  } else {
    commit({
      ...state,
      starred: { ...state.starred, [urlHash]: { at: Date.now() } },
    });
  }
}

/**
 * Remove any read/starred entries whose url_hash is not in `validHashes`.
 * Used by /bookmarks/ to clean up "orphan" entries when articles are deleted
 * from the build. No-op if nothing changes.
 */
export function clearOrphans(validHashes: Set<string>): void {
  let changed = false;
  const nextRead: Record<string, { at: number; y: number }> = {};
  for (const [k, v] of Object.entries(state.read)) {
    if (validHashes.has(k)) nextRead[k] = v;
    else changed = true;
  }
  const nextStarred: Record<string, { at: number }> = {};
  for (const [k, v] of Object.entries(state.starred)) {
    if (validHashes.has(k)) nextStarred[k] = v;
    else changed = true;
  }
  if (!changed) return;
  commit({ read: nextRead, starred: nextStarred });
}

// ===========================================================================
// Cross-tab sync via storage event
// ===========================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== READING_STATE_STORAGE_KEY) return;
    if (e.newValue === null) {
      // Cleared in another tab.
      state = emptyState();
    } else {
      try {
        const parsed = JSON.parse(e.newValue) as { data?: unknown };
        const result = readingStateDataSchema.safeParse(parsed?.data);
        if (result.success) state = result.data;
      } catch {
        // Ignore malformed cross-tab payloads — keep current state.
      }
    }
    notify();
  });
}

// Export safeRemove for the /bookmarks/ "clear all" button (Phase 6).
export function clearAll(): void {
  safeRemove(READING_STATE_STORAGE_KEY);
  state = emptyState();
  notify();
}

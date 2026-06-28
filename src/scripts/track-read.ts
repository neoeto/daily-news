/**
 * Article read-tracking — client-side detector that marks articles as read
 * when the user reaches the bottom, saves scroll position on leave, and
 * restores scroll position on revisit.
 *
 * Design: see openspec/changes/add-reading-state/design.md (D4, D5).
 *
 * Constraints:
 *   - IntersectionObserver-based (no high-frequency scroll listeners).
 *   - visibilitychange + pagehide for save (never unload/beforeunload —
 *     the latter doesn't fire on iOS Safari and breaks bfcache).
 *   - 500ms dwell debounce to filter bounce-scrolls.
 *   - One-shot: observer disconnects after first trigger.
 *   - Restores scroll only after all images decode (prevents offset jump).
 *   - saveScrollOnLeave only updates EXISTING read entries — partial reads
 *     (user left without reaching bottom) do NOT create a read entry, so
 *     "已读" still means "user reached the bottom".
 */
import { markRead, getState } from './reading-state';

interface TrackOpts {
  urlHash: string;
  sentinel: HTMLElement;
  /** How long the sentinel must stay in view before marking read. Default 500ms. */
  minDwellMs?: number;
}

/**
 * Observe `sentinel` and mark `urlHash` as read once it stays in view for
 * `minDwellMs`. Returns a cleanup function (for tests / HMR).
 *
 * Config: `threshold: 1.0` (sentinel fully visible) + `rootMargin: '0px 0px -10% 0px'`
 * (shrink root by 10% from bottom → user must scroll to near-bottom).
 */
export function trackArticleCompletion(opts: TrackOpts): () => void {
  const { urlHash, sentinel, minDwellMs = 500 } = opts;
  let dwellTimer: ReturnType<typeof setTimeout> | undefined;
  let done = false;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry || done) return;
      if (!entry.isIntersecting) {
        if (dwellTimer) {
          clearTimeout(dwellTimer);
          dwellTimer = undefined;
        }
        return;
      }
      // Sentinel is in view — start (or keep) the dwell timer.
      if (dwellTimer) return;
      dwellTimer = setTimeout(() => {
        done = true;
        markRead(urlHash, { y: window.scrollY });
        observer.disconnect();
        if (dwellTimer) clearTimeout(dwellTimer);
        dwellTimer = undefined;
      }, minDwellMs);
    },
    { threshold: 1.0, rootMargin: '0px 0px -10% 0px' },
  );

  observer.observe(sentinel);

  return () => {
    observer.disconnect();
    if (dwellTimer) clearTimeout(dwellTimer);
  };
}

/**
 * Save scroll position when the user leaves (tab hidden or page closed).
 * Only updates EXISTING read entries — does NOT create one. So a partial
 * read (left before reaching bottom) is NOT marked read; the saved y of an
 * already-read article advances monotonically as the user reads further.
 *
 * MUST NOT use unload/beforeunload (see design.md D5).
 */
export function saveScrollOnLeave(urlHash: string): void {
  function save(): void {
    const entry = getState().read[urlHash];
    if (!entry) return;
    const currentY = window.scrollY;
    if (currentY > entry.y) {
      markRead(urlHash, { y: currentY });
    }
  }

  function onVisChange(): void {
    if (document.visibilityState === 'hidden') save();
  }

  window.addEventListener('visibilitychange', onVisChange);
  window.addEventListener('pagehide', save);
}

/**
 * Restore the saved scroll position for `urlHash`, if any. Waits for all
 * images to decode first (prevents the restored offset from being wrong
 * due to late-arriving image layout). Skipped for short articles (less
 * than 1.5× viewport) where restore is meaningless.
 */
export async function restoreScrollIfAny(urlHash: string): Promise<void> {
  const entry = getState().read[urlHash];
  if (!entry || entry.y <= 0) return;
  if (document.body.scrollHeight < window.innerHeight * 1.5) return;

  const imgs = Array.from(document.images);
  await Promise.allSettled(
    imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {}))),
  );
  window.scrollTo(0, entry.y);
}

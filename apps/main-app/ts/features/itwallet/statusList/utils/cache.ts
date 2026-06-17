import { type StatusListPayload } from "./schemas";
import { StatusListRepository } from "./repository";
import { refreshStatusListToken } from "./refresh";
import { isStale } from "./validity";

/** Maximum number of concurrent refresh operations. */
const MAX_CONCURRENT_REFRESHES = 3;

/**
 * Executes refresh operations in parallel with bounded concurrency.
 * Each refresh is best-effort: individual failures do not affect others.
 */
const refreshWithBoundedParallelism = async (
  uris: Array<string>
): Promise<void> => {
  const batches = Array.from(
    { length: Math.ceil(uris.length / MAX_CONCURRENT_REFRESHES) },
    (_, idx) =>
      uris.slice(
        idx * MAX_CONCURRENT_REFRESHES,
        idx * MAX_CONCURRENT_REFRESHES + MAX_CONCURRENT_REFRESHES
      )
  );
  for (const batch of batches) {
    await Promise.allSettled(batch.map(uri => refreshStatusListToken(uri)));
  }
};

/**
 * Startup coherence: owner-aware cache maintenance.
 *
 * When `referencedStatusListUris` is provided:
 * 1. Deduplicates the referenced URIs
 * 2. Lists the cache once
 * 3. Removes cached entries no longer referenced by any owner
 * 4. Identifies missing entries (referenced but not cached)
 * 5. Identifies stale entries (referenced and cached but expired)
 * 6. Refreshes missing and stale entries with bounded parallelism
 *
 * When `referencedStatusListUris` is `undefined` (owner metadata not yet available),
 * skips pruning and only refreshes stale cached entries (same as background).
 *
 * @param referencedStatusListUris - Status List URIs from Redux, or undefined if unavailable
 * @param now - Current time in ms since epoch (injected for testability)
 */
export const startupCoherence = async (
  referencedStatusListUris: Array<string> | undefined,
  now: number = Date.now()
): Promise<void> => {
  const cached = await StatusListRepository.list();

  if (referencedStatusListUris === undefined) {
    // Owner metadata not available: refresh stale only, no pruning
    const staleUris = cached
      .filter(payload => isStale(payload, now))
      .map(payload => payload.sub);

    await refreshWithBoundedParallelism(staleUris);
    return;
  }

  const uniqueRefs = [...new Set(referencedStatusListUris)];
  const cachedUris = new Set(cached.map(payload => payload.sub));
  const cachedByUri = new Map<string, StatusListPayload>(
    cached.map(payload => [payload.sub, payload])
  );

  // Remove unreachable: cached but not referenced
  const unreachable = cached
    .map(payload => payload.sub)
    .filter(uri => !uniqueRefs.includes(uri));

  if (unreachable.length > 0) {
    await StatusListRepository.removeMany(unreachable);
  }

  // Collect URIs that need refresh: missing or stale
  const urisToRefresh = uniqueRefs.filter(uri => {
    if (!cachedUris.has(uri)) {
      return true; // Missing
    }
    const payload = cachedByUri.get(uri);
    return payload !== undefined && isStale(payload, now);
  });

  await refreshWithBoundedParallelism(urisToRefresh);
};

/**
 * Background refresh: owner-blind cache maintenance.
 *
 * 1. Lists the cache once
 * 2. Refreshes only stale entries with bounded parallelism
 *
 * Does not prune unreachable entries (no owner metadata available).
 *
 * @param now - Current time in ms since epoch (injected for testability)
 */
export const backgroundRefresh = async (
  now: number = Date.now()
): Promise<void> => {
  const cached = await StatusListRepository.list();

  const staleUris = cached
    .filter(payload => isStale(payload, now))
    .map(payload => payload.sub);

  await refreshWithBoundedParallelism(staleUris);
};

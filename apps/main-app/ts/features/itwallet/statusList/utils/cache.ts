import { StatusListRepository } from "./repository";
import { refreshStatusListToken } from "./refresh";
import { isStale } from "./validity";
import { StatusListContext } from "./types";

/** Maximum number of concurrent refresh operations. */
const MAX_CONCURRENT_REFRESHES = 3;

/**
 * Executes refresh operations in parallel with bounded concurrency.
 * Each refresh is best-effort: individual failures do not affect others.
 */
const refreshWithBoundedParallelism = async (
  context: StatusListContext,
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
    await Promise.allSettled(
      batch.map(uri => refreshStatusListToken(context, uri))
    );
  }
};

/**
 * Startup pruning: removes cached Status List entries no longer referenced by
 * any owner (credentials, Wallet Instance/Unit Attestations).
 *
 * Deduplicates `referencedStatusListUris` and removes every cached entry whose
 * URI is not referenced. An empty array prunes the whole cache.
 *
 * Refreshing referenced/stale entries is a separate concern handled by
 * `refreshStaleEntries`.
 *
 * @param referencedStatusListUris - Status List URIs referenced by current owners
 */
export const startupCoherence = async (
  referencedStatusListUris: ReadonlyArray<string>
): Promise<void> => {
  const cached = await StatusListRepository.list();
  const uniqueRefs = new Set(referencedStatusListUris);

  // Remove unreferenced: cached but not referenced by any owner
  const unreferenced = cached
    .map(payload => payload.sub)
    .filter(uri => !uniqueRefs.has(uri));

  if (unreferenced.length > 0) {
    await StatusListRepository.removeMany(unreferenced);
  }
};

/**
 * Owner-blind cache refresh, usable both at startup and from the background task.
 *
 * 1. Lists the cache once
 * 2. Refreshes only stale entries with bounded parallelism
 *
 * Does not prune unreferenced entries; pruning is handled by `startupCoherence`.
 *
 * @param now - Current time in ms since epoch (injected for testability)
 */
export const refreshStaleEntries = async (
  context: StatusListContext,
  now: number = Date.now()
): Promise<void> => {
  const cached = await StatusListRepository.list();

  const staleUris = cached
    .filter(payload => isStale(payload, now))
    .map(payload => payload.sub);

  await refreshWithBoundedParallelism(context, staleUris);
};

import { getKeysForStatusListToken } from ".";
import { assert } from "../../../../utils/assert";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { StatusListRepository } from "./repository";
import { storeLastStatusListCheckTimestamp } from "./storage";
import { StatusListVerificationContext } from "./types";
import { isStale } from "./validity";

/** Maximum number of concurrent refresh operations. */
const MAX_CONCURRENT_REFRESHES = 3;

/**
 * Fetches, decodes, validates, and persists a Status List Token for the given URI.
 * The URI serves both as cache identity and fetch endpoint (matches the JWT `sub` claim).
 *
 * Best-effort: returns `true` on success, `false` on any failure.
 * A failed refresh never evicts an existing cached entry.
 */
export const refreshStatusListToken = async (
  { itwVersion, x509CertRoot }: StatusListVerificationContext,
  uri: string
): Promise<boolean> => {
  try {
    const ioWallet = getIoWallet(itwVersion);
    assert(
      ioWallet.CredentialStatus.statusList.isSupported,
      `Status List is not supported by IT-Wallet v${itwVersion}`
    );

    const statusList = await ioWallet.CredentialStatus.statusList.getByUri(uri);
    const keys = await getKeysForStatusListToken(statusList, x509CertRoot);
    const parsed = await ioWallet.CredentialStatus.statusList.verifyAndParse(
      keys,
      statusList
    );

    assert(
      parsed.sub === uri,
      `Status List Token sub does not match URI ${uri}`
    );

    await StatusListRepository.upsert(uri, parsed);
    return true;
  } catch {
    return false;
  }
};

/**
 * Executes refresh operations in parallel with bounded concurrency.
 * Each refresh is best-effort: individual failures do not affect others.
 */
export const refreshWithBoundedParallelism = async (
  context: StatusListVerificationContext,
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
  context: StatusListVerificationContext
): Promise<void> => {
  const now = Date.now();
  const entries = await StatusListRepository.list();

  const staleUris = entries
    .filter(payload => isStale(payload, now))
    .map(payload => payload.sub);

  await refreshWithBoundedParallelism(context, staleUris);
  await storeLastStatusListCheckTimestamp(now);
};

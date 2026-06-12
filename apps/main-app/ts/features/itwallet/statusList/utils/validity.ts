import { type StoredStatusList } from "./schemas";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Determines whether a cached Status List Token is stale and should be refreshed.
 * Uses the following precedence:
 *
 * 1. If `ttl` is present: stale when `resolvedAt + ttl` has passed
 * 2. Else if `exp` is present: stale when `exp` has passed
 * 3. Else if `iat` is present: stale when `iat + 24h` has passed
 * 4. Otherwise: always stale
 *
 * @param entry - The cached Status List Token entry
 * @param now - Current time in milliseconds since epoch (injected for testability)
 */
export const isStale = (entry: StoredStatusList, now: number): boolean => {
  const { payload, meta } = entry;

  if (payload.ttl !== undefined) {
    return meta.resolvedAt + payload.ttl * 1000 < now;
  }

  if (payload.exp !== undefined) {
    return payload.exp * 1000 < now;
  }

  if (payload.iat !== undefined) {
    return payload.iat * 1000 + TWENTY_FOUR_HOURS_MS < now;
  }

  return true;
};

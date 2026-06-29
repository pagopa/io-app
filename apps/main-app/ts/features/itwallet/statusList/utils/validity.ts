import { type CredentialStatus } from "@pagopa/io-react-native-wallet";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const SECONDS_TO_MS = 1000;

/**
 * Determines whether a cached Status List Token is stale and should be refreshed.
 *
 * Since the spec mandates `iat`, staleness always has a baseline.
 * Precedence:
 * 1. If `ttl` is present: stale when `iat + ttl` has passed (ttl is the max
 *    cache lifetime in seconds and takes priority over `exp`)
 * 2. Else if `exp` is present: stale when `exp` has passed
 * 3. Otherwise: stale when `iat + 24h` has passed
 *
 * @param payload - The cached Status List Token payload
 * @param now - Current time in milliseconds since epoch (injected for testability)
 */
export const isStale = (
  payload: CredentialStatus.StatusList,
  now: number
): boolean => {
  if (payload.ttl !== undefined) {
    return payload.iat * SECONDS_TO_MS + payload.ttl * SECONDS_TO_MS < now;
  }

  if (payload.exp !== undefined) {
    return payload.exp * SECONDS_TO_MS < now;
  }

  return payload.iat * SECONDS_TO_MS + TWENTY_FOUR_HOURS_MS < now;
};

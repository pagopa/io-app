import * as O from "fp-ts/lib/Option";

import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { OneIdentityEnv } from "../reducers/loginConfig";

const oneIdentityRemoteConfigSelector = (state: GlobalState) =>
  O.toUndefined(remoteConfigSelector(state))?.oneIdentity;

/**
 * Retrieves the remote rollout percentage (0-100) for the OneIdentity login.
 *
 * Defaults to `0` (disabled) if the remote configuration is not yet loaded
 * or if the field is missing.
 */
export const oneIdentityRolloutPercentageSelector = (state: GlobalState) => {
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return oneIdentityConfig?.rolloutPercentage ?? 0;
};

export const FALLBACK_ONE_IDENTITY_IDPS_URL_PROD =
  "https://io.oneid.pagopa.it/idps";
export const FALLBACK_ONE_IDENTITY_IDPS_URL_UAT =
  "https://uat.io.oneid.pagopa.it/idps";

/**
 * Returns the fallback OneIdentity IDPs list URL for the given environment.
 * @param env The OneIdentity environment.
 * @returns The fallback OneIdentity IDPs list URL for the given environment.
 */
const fallbackOneIdentityIdpsUrl = (env: OneIdentityEnv) =>
  env === "uat"
    ? FALLBACK_ONE_IDENTITY_IDPS_URL_UAT
    : FALLBACK_ONE_IDENTITY_IDPS_URL_PROD;

/**
 * Retrieves the OneIdentity IDPs list URL for the given environment.
 */
export const oneIdentityIdpsUrlSelector = (
  state: GlobalState,
  env: OneIdentityEnv
): string => {
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return (
    oneIdentityConfig?.environments?.[env]?.idpsUrl ??
    fallbackOneIdentityIdpsUrl(env)
  );
};

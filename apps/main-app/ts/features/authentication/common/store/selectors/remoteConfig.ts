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

/**
 * Fallback OneIdentity IDPs list URL for each environment.
 */
export const FALLBACK_ONE_IDENTITY_IDPS_URLS: Record<OneIdentityEnv, string> = {
  prod: "https://io.oneid.pagopa.it/idps",
  uat: "https://uat.io.oneid.pagopa.it/idps"
};

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
    FALLBACK_ONE_IDENTITY_IDPS_URLS[env]
  );
};

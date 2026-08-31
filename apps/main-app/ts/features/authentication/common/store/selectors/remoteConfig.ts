import * as O from "fp-ts/lib/Option";

import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isTestEnv } from "../../../../../utils/environment";
import { OneIdentityEnv } from "../reducers/loginConfig";
import { oneIdentityEnvSelector } from "./loginConfig";

const oneIdentityRemoteConfigSelector = (state: GlobalState) =>
  O.toUndefined(remoteConfigSelector(state))?.oneIdentity;

/**
 * Retrieves the remote rollout percentage (0-100) for the OneIdentity login.
 *
 * Defaults to `0` (disabled) if the remote configuration is not yet loaded or
 * if the field is missing.
 */
export const oneIdentityRolloutPercentageSelector = (state: GlobalState) => {
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return oneIdentityConfig?.rolloutPercentage ?? 0;
};

/** Fallback OneIdentity IDPs list URL for each environment. */
const FALLBACK_ONE_IDENTITY_IDPS_URLS: Record<OneIdentityEnv, string> = {
  prod: "https://io.oneid.pagopa.it/idps",
  uat: "https://uat.io.oneid.pagopa.it/idps"
};

/**
 * Retrieves the OneIdentity IDPs list URL for the current OneIdentity
 * environment.
 */
export const oneIdentityIdpsUrlSelector = (state: GlobalState) => {
  const env = oneIdentityEnvSelector(state);
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return (
    oneIdentityConfig?.environments?.[env]?.idpsUrl ??
    FALLBACK_ONE_IDENTITY_IDPS_URLS[env]
  );
};

export const testable = isTestEnv
  ? {
      FALLBACK_ONE_IDENTITY_IDPS_URLS
    }
  : undefined;

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
 * Defaults to `0` (disabled) if the remote configuration is not yet loaded
 * or if the field is missing.
 */
export const oneIdentityRolloutPercentageSelector = (state: GlobalState) => {
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return oneIdentityConfig?.rolloutPercentage ?? 0;
};

/**
 * OneIdentity fallback configurations for each environment.
 */
const FALLBACK_ONE_IDENTITY_CONFIG: Record<
  OneIdentityEnv,
  { idpFriendlyNamesUrl: string; idpsUrl: string }
> = {
  prod: {
    idpsUrl: "https://io.oneid.pagopa.it/idps",
    idpFriendlyNamesUrl:
      "https://assets.io.oneid.pagopa.it/assets/idpFriendlyNameList.json"
  },
  uat: {
    idpsUrl: "https://uat.io.oneid.pagopa.it/idps",
    idpFriendlyNamesUrl:
      "https://assets.uat.io.oneid.pagopa.it/assets/idpFriendlyNameList.json"
  }
};

/**
 * Retrieves the URL of the OneIdentity IDP list for the current environment.
 */
export const oneIdentityIdpsUrlSelector = (state: GlobalState) => {
  const env = oneIdentityEnvSelector(state);
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return (
    oneIdentityConfig?.environments?.[env]?.idpsUrl ??
    FALLBACK_ONE_IDENTITY_CONFIG[env].idpsUrl
  );
};

/**
 * Retrieves the URL of the OneIdentity IDP friendly names for the current environment.
 */
export const oneIdentityIdpFriendlyNamesUrlSelector = (state: GlobalState) => {
  const env = oneIdentityEnvSelector(state);
  const oneIdentityConfig = oneIdentityRemoteConfigSelector(state);
  return (
    oneIdentityConfig?.environments?.[env]?.idpFriendlyNamesUrl ??
    FALLBACK_ONE_IDENTITY_CONFIG[env].idpFriendlyNamesUrl
  );
};

export const testable = isTestEnv
  ? {
      FALLBACK_ONE_IDENTITY_CONFIG
    }
  : undefined;

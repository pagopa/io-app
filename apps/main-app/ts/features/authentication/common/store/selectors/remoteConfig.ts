import * as O from "fp-ts/lib/Option";

import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";

export const oneIdentityRemoteConfigSelector = (state: GlobalState) => {
  const remoteConfig = remoteConfigSelector(state);
  return O.isSome(remoteConfig) ? remoteConfig.value.oneIdentity : undefined;
};

/**
 * Retrieves the remote rollout percentage (0-100) for the OneIdentity login.
 *
 * Defaults to `0` (disabled) if the remote configuration is not yet loaded
 * or if the field is missing.
 */
export const oneIdentityRolloutPercentageSelector = (state: GlobalState) =>
  oneIdentityRemoteConfigSelector(state)?.rolloutPercentage ?? 0;

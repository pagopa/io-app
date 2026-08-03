import * as O from "fp-ts/lib/Option";

import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * Retrieves the remote rollout percentage (0-100) for the OneIdentity login.
 *
 * Defaults to `0` (disabled) if the remote configuration is not yet loaded
 * or if the field is missing.
 */
export const oneIdentityRolloutPercentageSelector = (state: GlobalState) => {
  const remoteConfig = remoteConfigSelector(state);

  if (O.isSome(remoteConfig)) {
    return remoteConfig.value.oneIdentity?.rolloutPercentage ?? 0;
  }
  return 0;
};

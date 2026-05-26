import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types.ts";
import { isMinAppVersionSupported } from "../../../../store/reducers/featureFlagWithMinAppVersionStatus.ts";

const fciRemoteConfigSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(config => config.fci)
  );

/**
 * Return the remote config about FCI's Security Level Check (if it requires L3 auth) enabled/disabled
 * if there is no data or the local Feature Flag is disabled,
 * false is the default value -> (FCI's Security Level Check disabled)
 */
export const isFciSecurityLevelCheckRemoteFFEnabledSelector = (
  state: GlobalState
) =>
  pipe(
    state,
    fciRemoteConfigSelector,
    fciConfig =>
      isMinAppVersionSupported(fciConfig) &&
      pipe(
        fciConfig,
        O.chainNullableK(fci => fci.security_level_check),
        isMinAppVersionSupported
      )
  );

/**
 * Return the remote config help center url for the FCI security level check.
 */
export const fciSecurityLevelCheckHelpCenterUrlSelector = createSelector(
  fciRemoteConfigSelector,
  fciConfig =>
    pipe(
      fciConfig,
      O.map(fci => fci.security_level_check?.helpCenter_url),
      O.toUndefined
    )
);

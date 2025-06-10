import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { isActiveSessionLoginLocallyEnabledSelector } from "../../../loginPreferences/store/selectors";

export const isActiveSessionLoginRemotelyEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chain(config => O.fromNullable(config.loginConfig?.activeSessionLogin)),
      isMinAppVersionSupported
    )
);

export const isActiveSessionLoginEnabledSelector = createSelector(
  isActiveSessionLoginRemotelyEnabledSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  (isRemotelyEnabled, isLocalFlagEnabled) =>
    isRemotelyEnabled || isLocalFlagEnabled
);

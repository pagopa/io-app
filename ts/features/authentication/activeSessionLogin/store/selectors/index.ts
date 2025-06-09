import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { isActiveSessionLoginLocallyEnabledSelector } from "../../../loginPreferences/store/selectors";

export const loginConfigSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => config.loginConfig)
    )
);

export const activeSessionLoginSelector = createSelector(
  loginConfigSelector,
  loginConfig =>
    pipe(
      loginConfig,
      O.map(config => config?.activeSessionLogin)
    )
);

export const isActiveSessionLoginRemotelyEnabledSelector = createSelector(
  activeSessionLoginSelector,
  activeSessionLogin => pipe(activeSessionLogin, isMinAppVersionSupported)
);

export const isActiveSessionLoginEnabledSelector = createSelector(
  isActiveSessionLoginRemotelyEnabledSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  (isRemotelyEnabled, isLocalFlagEnabled) =>
    isRemotelyEnabled || isLocalFlagEnabled
);

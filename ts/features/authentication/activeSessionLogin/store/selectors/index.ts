import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { GlobalState } from "../../../../../store/reducers/types";

export const isActiveSessionLoginLocallyEnabledSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.activeSessionLogin.activeSessionLoginLocalFlag;

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

export const isActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.isActiveSessionLogin ?? false;

export const activeSessionUserLoggedSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.isUserLoggedIn;

export const idpSelectedActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.idp;

export const newTokenActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.token;

export const isActiveSessionFastLoginEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.fastLoginOptIn ??
  false;

export const activeSessionLoginInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo;

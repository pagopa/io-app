import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { fastLoginOptIn, fastLoginEnabled } from "../../../../../config";
import { GlobalState } from "../../../../../store/reducers/types";
import { isPropertyWithMinAppVersionEnabled } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";

export const fastLoginOptInSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.optIn;

export const hasTwoMinutesElapsedSinceLastActivitySelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.fastLogin.automaticSessionRefresh
    .areAlreadyTwoMinAfterLastActivity;

const securityAdviceAcknowledgedSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.securityAdviceAcknowledged;

export const isSecurityAdviceAcknowledgedEnabled = createSelector(
  securityAdviceAcknowledgedSelector,
  value => value.acknowledged
);

export const isSecurityAdviceReadyToShow = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.securityAdviceAcknowledged.readyToShow;

/**
 * return the remote config about FastLoginOptIn enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (FastLoginOptIn disabled)
 */
export const fastLoginOptInFFEnabled = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: fastLoginEnabled,
      configPropertyName: "fastLogin",
      optionalLocalFlag: fastLoginOptIn,
      optionalConfig: "opt_in"
    })
);

const isFastLoginOptInEnabledSelector = createSelector(
  fastLoginOptInFFEnabled,
  fastLoginOptInSelector,
  (featureFlag, optIn) => {
    if (featureFlag) {
      return optIn.enabled;
    }
    return true;
  }
);

/**
 * return the remote config about FastLogin enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (FastLogin disabled)
 */
export const isFastLoginFFEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: fastLoginEnabled,
      configPropertyName: "fastLogin"
    })
);

/**
 * return the remote config about FastLogin enabled/disabled
 * based on a minumum version of the app, combined with FL opt-in user preference.
 * If there is no data from backend nor user expressed an opt-in preference,
 * false is the default value -> (FastLogin disabled)
 */
export const isFastLoginEnabledSelector = createSelector(
  isFastLoginFFEnabledSelector,
  isFastLoginOptInEnabledSelector,
  (fastloginFFEnabled, optInEnabled) => fastloginFFEnabled && !!optInEnabled
);

const fastLoginTokenRefreshHandlerSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler;

export const fastLoginPendingActionsSelector = createSelector(
  fastLoginTokenRefreshHandlerSelector,
  fastLoginTokenRefresh =>
    uniqWith(fastLoginTokenRefresh.pendingActions, isEqual)
);

export const isFastLoginUserInteractionNeededForSessionExpiredSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler
    .userInteractionForSessionExpiredNeeded;

export const tokenRefreshSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler.tokenRefresh;

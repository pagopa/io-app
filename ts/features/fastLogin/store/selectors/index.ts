import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import { fastLoginOptIn, fastLoginEnabled } from "../../../../config";
import { GlobalState } from "../../../../store/reducers/types";
import { isPropertyWithMinAppVersionEnabled } from "../../../../store/reducers/featureFlagWithMinAppVersionStatus";

export const fastLoginOptInSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.optIn;

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
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled({
      backendStatus,
      mainLocalFlag: fastLoginEnabled,
      configPropertyName: "fastLogin",
      optionalLocalFlag: fastLoginOptIn,
      optionalConfig: "opt_in"
    })
);

/**
 * return the remote config about FastLoginSessionRefresh enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (FastLoginSessionRefresh disabled)
 */
export const fastLoginSessionRefreshFFEnabled = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled({
      backendStatus,
      mainLocalFlag: fastLoginEnabled,
      configPropertyName: "fastLogin",
      optionalLocalFlag: fastLoginOptIn,
      optionalConfig: "sessionRefresh"
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
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled({
      backendStatus,
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

/**
 * if the fast login is active and has been chosen by the user (opt-in is true)
 * then if the remote FF of this functionality (fastLoginSessionRefreshFFEnabled)
 * is active, the user will see the implementation of the session refresh when
 * returning to foreground after at least 2 minutes of background
 */
export const isFastLoginSessionRefreshEnabledSelector = createSelector(
  isFastLoginEnabledSelector,
  fastLoginSessionRefreshFFEnabled,
  (isFastLoginEnabled, sessionRefresh) => isFastLoginEnabled && sessionRefresh
);

const fastLoginTokenRefreshHandlerSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler;

export const fastLoginPendingActionsSelector = createSelector(
  fastLoginTokenRefreshHandlerSelector,
  fastLoginTokenRefreshHandlerSelector =>
    uniqWith(fastLoginTokenRefreshHandlerSelector.pendingActions, isEqual)
);

export const isFastLoginUserInteractionNeededForSessionExpiredSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler
    .userInteractionForSessionExpiredNeeded;

export const tokenRefreshSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.tokenRefreshHandler.tokenRefresh;

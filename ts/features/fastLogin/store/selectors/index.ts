import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import {
  fastLoginOptIn,
  fastLoginEnabled,
  isNewCduFlow
} from "../../../../config";
import { GlobalState } from "../../../../store/reducers/types";
import { isPropertyWithMinAppVersionEnabled } from "../../../../store/reducers/featureFlagWithMinAppVersionStatus";

export const isEmailUniquenessValidationEnabledSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled({
      backendStatus,
      mainLocalFlag: isNewCduFlow,
      configPropertyName: "emailUniquenessValidation"
    })
);

const fastLoginOptInSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.optIn;

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
const isFastLoginFFEnabled = createSelector(
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
  isFastLoginFFEnabled,
  isFastLoginOptInEnabledSelector,
  (fastloginFFEnabled, optInEnabled) => fastloginFFEnabled && !!optInEnabled
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

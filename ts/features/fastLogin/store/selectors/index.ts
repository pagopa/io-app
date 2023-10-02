import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import { fastLoginBypassOptInt, fastLoginEnabled } from "../../../../config";
import { GlobalState } from "../../../../store/reducers/types";
import { isPropertyWithMinAppVersionEnabled } from "./../../../../store/reducers/backendStatus";

const fastLoginOptInSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.optIn;

export const isFastLoginOptinEnabledSelector = createSelector(
  fastLoginOptInSelector,
  optIn => {
    if (fastLoginBypassOptInt) {
      return true;
    }
    return optIn.enabled;
  }
);
/**
 * return the remote config about FastLogin enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (FastLogin disabled)
 */
export const isFastLoginFFEnabled = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled(
      fastLoginEnabled,
      "fastLogin",
      backendStatus
    )
);

/**
 * return the remote config about FastLogin enabled/disabled
 * based on a minumum version of the app, combined with FL opt-in user preference.
 * If there is no data from backed nor user expressed an optin preference,
 * false is the default value -> (FastLogin disabled)
 */
export const isFastLoginEnabledSelector = createSelector(
  isFastLoginFFEnabled,
  isFastLoginOptinEnabledSelector,
  (fastloginFFEnabled, optInEnabled) => fastloginFFEnabled && !!optInEnabled
);

export const fastLoginTokenRefreshHandlerSelector = (state: GlobalState) =>
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

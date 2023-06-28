import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import { fastLoginEnabled } from "../../../../config";
import { GlobalState } from "../../../../store/reducers/types";
import { isPropertyWithMinAppVersionEnabled } from "./../../../../store/reducers/backendStatus";

/**
 * return the remote config about FastLogin enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (FastLogin disabled)
 */
export const isFastLoginEnabledSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled(
      fastLoginEnabled,
      "fastLogin",
      backendStatus
    )
);

export const fastLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin;

export const fastLoginPendingActionsSelector = createSelector(
  fastLoginSelector,
  fastLoginState => uniqWith(fastLoginState.pendingActions, isEqual)
);

export const isFastLoginUserInteractionNeededForSessionExpiredSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.fastLogin.userInteractionForSessionExpiredNeeded;

export const isTokenRefreshing = (state: GlobalState) =>
  state.features.loginFeatures.fastLogin.showLoading;

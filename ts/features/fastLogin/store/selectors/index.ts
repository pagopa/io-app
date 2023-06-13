import { createSelector } from "reselect";
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

export const isFastLoginUserInteractionNeededForSessionExpiredSelector =
  createSelector(
    (state: GlobalState) => state,
    state =>
      state.features.loginFeatures.fastLogin
        .userInteractionForSessionExpiredNeeded
  );

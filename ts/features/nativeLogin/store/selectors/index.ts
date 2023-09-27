import { createSelector } from "reselect";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import { nativeLoginEnabled } from "../../../../config";
import { isPropertyWithMinAppVersionEnabled } from "./../../../../store/reducers/backendStatus";

/**
 * return the remote config about NativeLogin enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (NativeLogin disabled)
 */
export const isNativeLoginEnabledSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled(
      nativeLoginEnabled,
      "nativeLogin",
      backendStatus
    )
);

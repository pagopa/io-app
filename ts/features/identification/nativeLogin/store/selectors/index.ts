import { createSelector } from "reselect";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { nativeLoginEnabled } from "../../../../../config";
import { isPropertyWithMinAppVersionEnabled } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";

/**
 * return the remote config about NativeLogin enabled/disabled
 * based on a minumum version of the app.
 * if there is no data, false is the default value -> (NativeLogin disabled)
 */
export const isNativeLoginEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: nativeLoginEnabled,
      configPropertyName: "nativeLogin"
    })
);

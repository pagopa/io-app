import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { itwLifecycleIsOperationalOrValid } from "../../../itwallet/lifecycle/store/selectors";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences";

export const isBlockingScreenSelector = (state: GlobalState) =>
  state.features.ingress.isBlockingScreen;

export const offlineAccessReasonSelector = (state: GlobalState) =>
  state.features.ingress.offlineAccessReason;

export const isDeviceOfflineWithWalletSelector = createSelector(
  isConnectedSelector,
  itwLifecycleIsOperationalOrValid,
  isItwOfflineAccessEnabledSelector,
  (
    isConnected,
    isOfflineAccessEnabled,
    selectItwLifecycleIsOperationalOrValid
  ) =>
    !isConnected &&
    isOfflineAccessEnabled &&
    selectItwLifecycleIsOperationalOrValid
);

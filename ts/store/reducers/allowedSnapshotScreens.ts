import { createSelector } from "reselect";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { isDebugModeEnabledSelector } from "./debug";

export const screenBlackList = new Set([ROUTES.WALLET_ADD_CARD]);

/**
 * Return {true} if the current screen can be snapshotted (android only).
 * If the app is in debug mode, the snapshot is always possible.
 */
export const isAllowedSnapshotCurrentScreen = createSelector(
  [isDebugModeEnabledSelector],
  debugEnabled =>
    debugEnabled
      ? true
      : !screenBlackList.has(NavigationService.getCurrentRouteName() ?? "")
);

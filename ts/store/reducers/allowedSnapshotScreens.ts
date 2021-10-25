import { createSelector } from "reselect";
import ROUTES from "../../navigation/routes";
import { currentRouteDebugSelector, isDebugModeEnabledSelector } from "./debug";

export const screenBlackList = new Set([ROUTES.WALLET_ADD_CARD]);

/**
 * Return {true} if the current screen can be snapshotted (android only).
 * If the app is in debug mode, the snapshot is always possible.
 */
export const isAllowedSnapshotCurrentScreen = createSelector(
  [currentRouteDebugSelector, isDebugModeEnabledSelector],
  (currentRoute, debugEnabled) =>
    debugEnabled ? true : !screenBlackList.has(currentRoute)
);

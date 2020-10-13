import { createSelector } from "reselect";
import ROUTES from "../../navigation/routes";
import { isDebugModeEnabledSelector } from "./debug";
import { plainNavigationCurrentRouteSelector } from "./navigation";

const defaultScreenBlackList: ReadonlyArray<string> = [ROUTES.WALLET_ADD_CARD];

export const screenBlackList = new Set(defaultScreenBlackList);

/**
 * Return {true} if the current screen can be snapshotted (android only).
 * If the app is in debug mode, the snapshot is always possible.
 */
export const isAllowedSnapshotCurrentScreen = createSelector(
  [plainNavigationCurrentRouteSelector, isDebugModeEnabledSelector],
  (currentRoute, debugEnabled) =>
    debugEnabled ? true : !screenBlackList.has(currentRoute)
);

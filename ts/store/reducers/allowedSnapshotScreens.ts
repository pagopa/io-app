import { createSelector } from "reselect";
import { bonusVacanzeEnabled } from "../../config";
import BONUSVACANZE_ROUTES from "../../features/bonusVacanze/navigation/routes";
import { isDebugModeEnabledSelector } from "./debug";
import { plainNavigationCurrentRouteSelector } from "./navigation";

const defaultScreenWhiteList: ReadonlyArray<string> = [];

const screenBonusVacanzaWhiteList: ReadonlyArray<string> = [
  BONUSVACANZE_ROUTES.MAIN,
  BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
  BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST,
  BONUSVACANZE_ROUTES.BONUS_CTA_ELIGILITY_START,
  BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION,
  BONUSVACANZE_ROUTES.BONUS_TOS_SCREEN,
  ...Object.keys(BONUSVACANZE_ROUTES.ELIGIBILITY).map(
    k => BONUSVACANZE_ROUTES.ELIGIBILITY[k]
  ),
  ...Object.keys(BONUSVACANZE_ROUTES.ACTIVATION).map(
    k => BONUSVACANZE_ROUTES.ACTIVATION[k]
  )
];

export const screenWhiteList = bonusVacanzeEnabled
  ? new Set([...defaultScreenWhiteList, ...screenBonusVacanzaWhiteList])
  : new Set(defaultScreenWhiteList);

/**
 * Return {true} if the current screen can be snapshotted (android only).
 * If the app is in debug mode, the snapshot is always possible.
 */
export const isAllowedSnapshotCurrentScreen = createSelector(
  [plainNavigationCurrentRouteSelector, isDebugModeEnabledSelector],
  (currentRoute, debugEnabled) =>
    debugEnabled ? true : screenWhiteList.has(currentRoute)
);

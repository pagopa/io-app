import { createSelector } from "reselect";
import { PaymentsOnboardingRoutes } from "../../features/payments/onboarding/navigation/routes";
import { ITW_ROUTES } from "../../features/itwallet/navigation/routes";
import { isDebugModeEnabledSelector } from "./debug";
import { currentRouteSelector } from "./navigation";

export const screenBlackList = new Set([
  PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD as string,
  ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN,
  ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
  ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
  ...Object.values(ITW_ROUTES.PRESENTATION)
]);

/**
 * Return {true} if a snapshot can be taken in the current screen (android only).
 * If the app is in debug mode, the snapshot is always possible.
 */
export const isAllowedSnapshotCurrentScreen = createSelector(
  [currentRouteSelector, isDebugModeEnabledSelector],
  (currentRoute, debugEnabled) =>
    debugEnabled ? true : !screenBlackList.has(currentRoute)
);

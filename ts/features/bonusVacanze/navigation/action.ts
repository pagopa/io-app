import { NavigationActions } from "react-navigation";
import BONUSVACANZE_ROUTES from "./routes";

export const navigateToBonusEligibilityLoading = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING
  });

export const navigateToIseeNotEligible = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE
  });

export const navigateToIseeNotAvailable = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE
  });

export const navigateToActivateBonus = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_REQUEST
  });

export const navigateToTimeoutEligibilityCheck = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT
  });

export const navigateToActivationLoading = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_LOADING
  });

export const navigateToActivationCompleted = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_COMPLETED
  });

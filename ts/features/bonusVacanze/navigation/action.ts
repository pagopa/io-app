import { NavigationActions } from "react-navigation";
import BONUSVACANZE_ROUTES from "./routes";

export const navigateToBonusEligibilityCheck = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY_CHECK
  });

export const navigateToIseeNotEligible = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY_ISEE_NOT_ELIGIBLE
  });

export const navigateToIseeNotAvailable = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY_ISEE_NOT_AVAILABLE
  });

export const navigateToActivateBonus = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY_ACTIVATE_BONUS
  });

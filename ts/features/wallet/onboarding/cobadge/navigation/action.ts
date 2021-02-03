import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_COBADGE_ROUTES from "./routes";

export const navigateToOnboardingCoBadgeSearchStartScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_COBADGE_ROUTES.START
  });

export const navigateToOnboardingCoBadgeSearchAvailable = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE
  });

export const navigateToOnboardingCoBadgeAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_COBADGE_ROUTES.ADD_COBADGE
  });

export const navigateToActivateBpdOnNewCoBadge = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW
  });

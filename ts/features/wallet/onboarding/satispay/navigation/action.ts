import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "./routes";

export const navigateToOnboardingSatispayStart = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.START
  });

export const navigateToOnboardingSatispaySearchAvailableUserAccount = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.SEARCH_AVAILABLE_USER_SATISPAY
  });

export const navigateToOnboardingSatispayAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.ADD_SATISPAY
  });

export const navigateToSuggestBpdActivation = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.SUGGEST_BPD_ACTIVATION
  });

export const navigateToActivateBpdOnNewSatispay = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.ACTIVATE_BPD_NEW_SATISPAY
  });

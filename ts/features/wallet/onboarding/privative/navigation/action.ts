import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "./routes";

export const navigateToOnboardingPrivativeChooseBrandScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_BRAND
  });

export const navigateToOnboardingPrivativeInsertCardNumberScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.INSERT_CARD_NUMBER
  });

export const navigateToOnboardingPrivativeSearchAvailable = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE
  });

export const navigateToOnboardingPrivativeAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.ADD_PRIVATIVE
  });

export const navigateToActivateBpdOnNewPrivative = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.ACTIVATE_BPD_NEW
  });

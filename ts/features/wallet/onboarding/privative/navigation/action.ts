import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingPrivativeChooseIssuerScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingPrivativeInsertCardNumberScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.INSERT_CARD_NUMBER
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingPrivativeKoDisabledScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.DISABLED_ISSUER
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingPrivativeKoUnavailableScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.UNAVAILABLE_ISSUER
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingPrivativeSearchAvailable = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToActivateBpdOnNewPrivative = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_PRIVATIVE_ROUTES.ACTIVATE_BPD_NEW
      }
    })
  );

import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPaySearchStartScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BPAY_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BPAY_ROUTES.START
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPayChooseBank = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BPAY_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPaySearchAvailableUserAccount = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BPAY_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToActivateBpdOnNewBPay = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BPAY_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW
      }
    })
  );

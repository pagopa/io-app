import { NavigationActions } from "@react-navigation/compat";
import NavigationService from "../../../../../navigation/NavigationService";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPaySearchStartScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BPAY_ROUTES.START
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPayChooseBank = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingBPaySearchAvailableUserAccount = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToActivateBpdOnNewBPay = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW
    })
  );

import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../../navigation/NavigationService";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingSatispayStart = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.START
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingSatispaySearchAvailableUserAccount = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName:
        WALLET_ONBOARDING_SATISPAY_ROUTES.SEARCH_AVAILABLE_USER_SATISPAY
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingSatispayAdd = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.ADD_SATISPAY
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToSuggestBpdActivation = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.SUGGEST_BPD_ACTIVATION
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToActivateBpdOnNewSatispay = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_SATISPAY_ROUTES.ACTIVATE_BPD_NEW_SATISPAY
    })
  );

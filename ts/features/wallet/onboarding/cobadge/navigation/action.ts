import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { CoBadgeChooseTypeNavigationProps } from "../screens/CoBadgeChooseType";
import WALLET_ONBOARDING_COBADGE_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingCoBadgeChooseTypeStartScreen = (
  navigationParams: CoBadgeChooseTypeNavigationProps
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_COBADGE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE,
        params: navigationParams
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingCoBadgeSearchStartScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_COBADGE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_COBADGE_ROUTES.START
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToOnboardingCoBadgeSearchAvailable = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_COBADGE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToActivateBpdOnNewCoBadge = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_COBADGE_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW
      }
    })
  );

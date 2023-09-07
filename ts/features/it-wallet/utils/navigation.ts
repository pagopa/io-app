import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

/**
 * Navigates to the ITW home screen without the need of having the correct navigation context.
 */
export const navigateToItWalletHome = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ITWALLET_HOME)
  );

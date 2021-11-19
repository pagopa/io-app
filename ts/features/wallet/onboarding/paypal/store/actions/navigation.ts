import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_PAYPAL_ROUTES from "../../navigation/routes";

export const navigateToPaypalSearchPsp = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PAYPAL_ROUTES.SEARCH_PSP
  });

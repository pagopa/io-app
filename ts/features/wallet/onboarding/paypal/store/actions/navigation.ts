import { NavigationActions } from "@react-navigation/compat";
import PAYPAL_ROUTES from "../../navigation/routes";

export const navigateToPaypalSearchPsp = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP
  });

export const navigateToPayPalCheckout = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.CHECKOUT
  });

export const navigateToPayPalCheckoutCompleted = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.CHECKOUT_COMPLETED
  });

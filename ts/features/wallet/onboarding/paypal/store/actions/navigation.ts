import { NavigationActions } from "react-navigation";
import PAYPAL_ROUTES from "../../navigation/routes";

export const navigateToPaypalSearchPsp = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP
  });

export const navigateToPayPalCheckout = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.CHECKOUT
  });

export const navigateToPayPalCheckoutSuccess = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.CHECKOUT_SUCCESS
  });

export const navigateToPayPalCheckoutFailure = () =>
  NavigationActions.navigate({
    routeName: PAYPAL_ROUTES.ONBOARDING.CHECKOUT_FAILURE
  });

import { createStackNavigator } from "react-navigation-stack";
import PayPalStartOnboardingScreen from "../screen/PayPalStartOnboardingScreen";
import PayPalPspSelectionScreen from "../screen/PayPalPspSelectionScreen";
import PaypalOnboardingCheckoutScreen from "../screen/PaypalOnboardingCheckoutScreen";
import PayPalOnboardingCompletedSuccessScreen from "../screen/PayPalOnboardingCompletedSuccessScreen";
import PAYPAL_ROUTES from "./routes";

export const paypalOnboardingNavigator = createStackNavigator(
  {
    [PAYPAL_ROUTES.ONBOARDING.START]: {
      screen: PayPalStartOnboardingScreen
    },
    [PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP]: {
      screen: PayPalPspSelectionScreen
    },
    [PAYPAL_ROUTES.ONBOARDING.CHECKOUT]: {
      screen: PaypalOnboardingCheckoutScreen
    },
    [PAYPAL_ROUTES.ONBOARDING.CHECKOUT_SUCCESS]: {
      screen: PayPalOnboardingCompletedSuccessScreen
    }
  },
  {
    // Let each screen handles the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

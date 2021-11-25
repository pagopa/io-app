import { createStackNavigator } from "react-navigation-stack";
import PayPalStartOnboardingScreen from "../screen/PayPalStartOnboardingScreen";
import PayPalPspSelectionScreen from "../screen/PayPalPspSelectionScreen";
import PayPalOnboardingCheckoutScreen from "../screen/PayPalOnboardingCheckoutScreen";
import PayPalOnboardingCompletedSuccessComponent from "../screen/PayPalOnboardingCompletedSuccessComponent";
import PayPalOnboardingCheckoutCompletedScreen from "../screen/PayPalOnboardingCheckoutCompletedScreen";
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
      screen: PayPalOnboardingCheckoutScreen
    },
    [PAYPAL_ROUTES.ONBOARDING.CHECKOUT_SUCCESS]: {
      screen: PayPalOnboardingCompletedSuccessComponent
    },
    [PAYPAL_ROUTES.ONBOARDING.CHECKOUT_COMPLETED]: {
      screen: PayPalOnboardingCheckoutCompletedScreen
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

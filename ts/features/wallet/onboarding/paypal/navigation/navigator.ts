import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import PayPalOnboardingCheckoutCompletedScreen from "../screen/PayPalOnboardingCheckoutCompletedScreen";
import PayPalOnboardingCheckoutScreen from "../screen/PayPalOnboardingCheckoutScreen";
import PayPalPspSelectionScreen from "../screen/PayPalPspSelectionScreen";
import PayPalStartOnboardingScreen from "../screen/PayPalStartOnboardingScreen";
import PAYPAL_ROUTES from "./routes";

export const PaymentMethodOnboardingPayPalOnboardingNavigator =
  createCompatNavigatorFactory(createStackNavigator)(
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
      [PAYPAL_ROUTES.ONBOARDING.CHECKOUT_COMPLETED]: {
        screen: PayPalOnboardingCheckoutCompletedScreen
      }
    },
    {
      // Let each screen handles the header and navigation
      headerMode: "none",
      defaultNavigationOptions: {
        gestureEnabled: false
      }
    }
  );

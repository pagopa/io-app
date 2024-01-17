import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PayPalOnboardingCheckoutCompletedScreen from "../screen/PayPalOnboardingCheckoutCompletedScreen";
import PayPalOnboardingCheckoutScreen from "../screen/PayPalOnboardingCheckoutScreen";
import PayPalPspSelectionScreen from "../screen/PayPalPspSelectionScreen";
import PayPalStartOnboardingScreen from "../screen/PayPalStartOnboardingScreen";
import { isGestureEnabled } from "../../../../../utils/navigation";
import PAYPAL_ROUTES from "./routes";
import { PaymentMethodOnboardingPayPalParamsList } from "./params";

const Stack = createStackNavigator<PaymentMethodOnboardingPayPalParamsList>();

export const PaymentMethodOnboardingPayPalOnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={PAYPAL_ROUTES.ONBOARDING.MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={PAYPAL_ROUTES.ONBOARDING.START}
      component={PayPalStartOnboardingScreen}
    />
    <Stack.Screen
      name={PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP}
      component={PayPalPspSelectionScreen}
    />
    <Stack.Screen
      name={PAYPAL_ROUTES.ONBOARDING.CHECKOUT}
      component={PayPalOnboardingCheckoutScreen}
    />
    <Stack.Screen
      name={PAYPAL_ROUTES.ONBOARDING.CHECKOUT_COMPLETED}
      component={PayPalOnboardingCheckoutCompletedScreen}
    />
  </Stack.Navigator>
);

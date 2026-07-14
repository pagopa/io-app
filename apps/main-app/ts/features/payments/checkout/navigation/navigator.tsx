import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import PaymentsContextualOnboardingWebViewScreen from "../../onboarding/screens/PaymentsContextualOnboardingWebViewScreen";
import { WalletPaymentDetailScreen } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentFailureScreen } from "../screens/WalletPaymentFailureScreen";
import { WalletPaymentInputFiscalCodeScreen } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentInputNoticeNumberScreen } from "../screens/WalletPaymentInputNoticeNumberScreen";
import { WalletPaymentMakeScreen } from "../screens/WalletPaymentMakeScreen";
import { WalletPaymentOutcomeScreen } from "../screens/WalletPaymentOutcomeScreen";
import WalletPaymentWebViewScreen from "../screens/WalletPaymentWebViewScreen";
import { PaymentsCheckoutParamsList } from "./params";
import { PaymentsCheckoutRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsCheckoutParamsList>();

export const PaymentsCheckoutNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      component={WalletPaymentInputNoticeNumberScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      component={WalletPaymentInputFiscalCodeScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      component={WalletPaymentDetailScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_NOTICE_SUMMARY}
      options={{
        gestureEnabled: isGestureEnabled,
        // Should be false by default: the headerShown is set to true once the payment details are loaded
        headerShown: false
      }}
    />
    <Stack.Screen
      component={WalletPaymentMakeScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      component={WalletPaymentOutcomeScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME}
      options={{
        gestureEnabled: false,
        headerShown: false
      }}
    />
    <Stack.Screen
      component={WalletPaymentFailureScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_FAILURE}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      component={WalletPaymentWebViewScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_WEB_VIEW}
      options={{
        gestureEnabled: false
      }}
    />
    <Stack.Screen
      component={PaymentsContextualOnboardingWebViewScreen}
      name={PaymentsCheckoutRoutes.PAYMENT_ONBOARDING_WEB_VIEW}
      options={{
        gestureEnabled: false
      }}
    />
  </Stack.Navigator>
);

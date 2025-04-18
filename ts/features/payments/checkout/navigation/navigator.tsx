import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
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
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER}
      component={WalletPaymentInputNoticeNumberScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE}
      component={WalletPaymentInputFiscalCodeScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_NOTICE_SUMMARY}
      component={WalletPaymentDetailScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        // Should be false by default: the headerShown is set to true once the payment details are loaded
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE}
      component={WalletPaymentMakeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME}
      component={WalletPaymentOutcomeScreen}
      options={{
        gestureEnabled: false,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_FAILURE}
      component={WalletPaymentFailureScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_WEB_VIEW}
      component={WalletPaymentWebViewScreen}
      options={{
        gestureEnabled: false
      }}
    />
  </Stack.Navigator>
);

export type PaymentsCheckoutStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsCheckoutParamsList & ParamList, RouteName>;

export type PaymentsCheckoutStackNavigation =
  PaymentsCheckoutStackNavigationProp<
    PaymentsCheckoutParamsList,
    keyof PaymentsCheckoutParamsList
  >;

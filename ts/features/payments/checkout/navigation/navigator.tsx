import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { WalletPaymentDetailScreen } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreen } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentInputNoticeNumberScreen } from "../screens/WalletPaymentInputNoticeNumberScreen";
import { WalletPaymentMakeScreen } from "../screens/WalletPaymentMakeScreen";
import { WalletPaymentOutcomeScreen } from "../screens/WalletPaymentOutcomeScreen";
import { PaymentsCheckoutParamsList } from "./params";
import { PaymentsCheckoutRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsCheckoutParamsList>();

export const PaymentsCheckoutNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_NAVIGATOR}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_INPUT_NOTICE_NUMBER}
      component={WalletPaymentInputNoticeNumberScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_INPUT_FISCAL_CODE}
      component={WalletPaymentInputFiscalCodeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_DETAIL}
      component={WalletPaymentDetailScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        // Should be false by default: the headerShown is set to true once the payment details are loaded
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_MAKE}
      component={WalletPaymentMakeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_OUTCOME}
      component={WalletPaymentOutcomeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
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

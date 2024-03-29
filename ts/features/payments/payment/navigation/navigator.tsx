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
import { PaymentsPaymentParamsList } from "./params";
import { PaymentsPaymentRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsPaymentParamsList>();

export const PaymentsPaymentNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_NAVIGATOR}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_INPUT_NOTICE_NUMBER}
      component={WalletPaymentInputNoticeNumberScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_INPUT_FISCAL_CODE}
      component={WalletPaymentInputFiscalCodeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_DETAIL}
      component={WalletPaymentDetailScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        // Should be false by default: the headerShown is set to true once the payment details are loaded
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_MAKE}
      component={WalletPaymentMakeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={PaymentsPaymentRoutes.PAYMENTS_PAYMENT_OUTCOME}
      component={WalletPaymentOutcomeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
  </Stack.Navigator>
);

export type PaymentsPaymentStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsPaymentParamsList & ParamList, RouteName>;

export type PaymentsPaymentStackNavigation = PaymentsPaymentStackNavigationProp<
  PaymentsPaymentParamsList,
  keyof PaymentsPaymentParamsList
>;

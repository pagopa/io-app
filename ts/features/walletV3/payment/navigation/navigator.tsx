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
import { WalletPaymentPickMethodScreen } from "../screens/WalletPaymentPickMethodScreen";
import { WalletPaymentOutcomeScreen } from "../screens/WalletPaymentOutcomeScreen";
import { WalletPaymentPickPspScreen } from "../screens/WalletPaymentPickPspScreen";
import { WalletPaymentConfirmScreen } from "../screens/WalletPaymentConfirmScreen";
import { WalletPaymentParamsList } from "./params";
import { WalletPaymentRoutes } from "./routes";

const Stack = createStackNavigator<WalletPaymentParamsList>();

export const WalletPaymentNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletPaymentRoutes.WALLET_PAYMENT_MAIN}
    headerMode={"screen"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER}
      component={WalletPaymentInputNoticeNumberScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE}
      component={WalletPaymentInputFiscalCodeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_DETAIL}
      component={WalletPaymentDetailScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_PICK_METHOD}
      component={WalletPaymentPickMethodScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP}
      component={WalletPaymentPickPspScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM}
      component={WalletPaymentConfirmScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME}
      component={WalletPaymentOutcomeScreen}
      options={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
    />
  </Stack.Navigator>
);

export type WalletPaymentStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletPaymentParamsList & ParamList, RouteName>;

export type WalletPaymentStackNavigation = WalletPaymentStackNavigationProp<
  WalletPaymentParamsList,
  keyof WalletPaymentParamsList
>;

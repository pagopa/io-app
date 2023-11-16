import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { WalletPaymentInputFiscalCodeScreen } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentInputNoticeNumberScreen } from "../screens/WalletPaymentInputNoticeNumberScreen";
import { WalletPaymentParamsList } from "./params";
import { WalletPaymentRoutes } from "./routes";

const Stack = createStackNavigator<WalletPaymentParamsList>();

export const WalletPaymentNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletPaymentRoutes.WALLET_PAYMENT_MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER}
      component={WalletPaymentInputNoticeNumberScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE}
      component={WalletPaymentInputFiscalCodeScreen}
      options={{
        gestureEnabled: isGestureEnabled
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

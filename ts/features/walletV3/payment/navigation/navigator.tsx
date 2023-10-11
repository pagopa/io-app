import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { WalletPaymentBarcodeScanScreen } from "../screens/WalletPaymentBarcodeScanScreen";

export const WalletPaymentRoutes = {
  WALLET_PAYMENT_MAIN: "_PAYMENT_MAIN",
  WALLET_PAYMENT_BARCODE_SCAN: "WALLET_PAYMENT_BARCODE_SCAN"
} as const;

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_SCAN]: undefined;
};

const Stack = createStackNavigator<WalletPaymentParamsList>();

export const WalletPaymentNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletPaymentRoutes.WALLET_PAYMENT_MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_SCAN}
      component={WalletPaymentBarcodeScanScreen}
      options={{
        ...TransitionPresets.ModalSlideFromBottomIOS,
        gestureEnabled: isGestureEnabled
      }}
    />
  </Stack.Navigator>
);

export type WalletPaymentStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletPaymentParamsList & ParamList, RouteName>;

export type WalletPaymentingStackNavigation = WalletPaymentStackNavigationProp<
  WalletPaymentParamsList,
  keyof WalletPaymentParamsList
>;

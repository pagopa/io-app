import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { WalletBarcodeChoiceScreen } from "../screens/WalletBarcodeChoiceScreen";
import { WalletBarcodeScanScreen } from "../screens/WalletBarcodeScanScreen";
import { WalletBarcodeParamsList } from "./params";
import { WalletBarcodeRoutes } from "./routes";

const Stack = createStackNavigator<WalletBarcodeParamsList>();

export const WalletBarcodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletBarcodeRoutes.WALLET_BARCODE_MAIN}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletBarcodeRoutes.WALLET_BARCODE_SCAN}
      component={WalletBarcodeScanScreen}
      options={{
        ...TransitionPresets.ModalSlideFromBottomIOS,
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletBarcodeRoutes.WALLET_BARCODE_CHOICE}
      component={WalletBarcodeChoiceScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
  </Stack.Navigator>
);

export type WalletBarcodeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletBarcodeParamsList & ParamList, RouteName>;

export type WalletBarcodeStackNavigation = WalletBarcodeStackNavigationProp<
  WalletBarcodeParamsList,
  keyof WalletBarcodeParamsList
>;

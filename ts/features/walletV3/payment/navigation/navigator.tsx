import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { WalletPaymentBarcodeChoiceScreen } from "../screens/WalletPaymentBarcodeChoiceScreen";
import { WalletPaymentBarcodeScanScreen } from "../screens/WalletPaymentBarcodeScanScreen";
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
      name={WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_SCAN}
      component={WalletPaymentBarcodeScanScreen}
      options={{
        ...TransitionPresets.ModalSlideFromBottomIOS,
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_CHOICE}
      component={WalletPaymentBarcodeChoiceScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
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

export type WalletPaymentingStackNavigation = WalletPaymentStackNavigationProp<
  WalletPaymentParamsList,
  keyof WalletPaymentParamsList
>;

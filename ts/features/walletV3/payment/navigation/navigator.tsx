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
import { WalletPaymentMethodListScreen } from "../screens/WalletPaymentMethodListScreen";
import { WalletPaymentOutcomeScreen } from "../screens/WalletPaymentOutcomeScreen";
import { WalletPaymentPspListScreen } from "../screens/WalletPaymentPspListScreen";
import { WalletPaymentReviewScreen } from "../screens/WalletPaymentReviewScreen";
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
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_DETAIL}
      component={WalletPaymentDetailScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_METHOD_LIST}
      component={WalletPaymentMethodListScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_PSP_LIST}
      component={WalletPaymentPspListScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_REVIEW}
      component={WalletPaymentReviewScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME}
      component={WalletPaymentOutcomeScreen}
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

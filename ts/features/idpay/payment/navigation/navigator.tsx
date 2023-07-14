import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import React from "react";
import {
  IDPayPaymentAuthorizationScreen,
  IDPayPaymentAuthorizationScreenRouteParams
} from "../screens/IDPayPaymentAuthorizationScreen";
import { IDPayPaymentCodeInputScreen } from "../screens/IDPayPaymentCodeInputScreen";
import { IDPayPaymentResultScreen } from "../screens/IDPayPaymentResultScreen";
import { IDPayPaymentMachineProvider } from "../xstate/provider";

export const IDPayPaymentRoutes = {
  IDPAY_PAYMENT_MAIN: "IDPAY_PAYMENT_MAIN",
  IDPAY_PAYMENT_CODE_SCAN: "IDPAY_PAYMENT_CODE_SCAN",
  IDPAY_PAYMENT_CODE_INPUT: "IDPAY_PAYMENT_CODE_INPUT",
  IDPAY_PAYMENT_AUTHORIZATION: "IDPAY_PAYMENT_AUTHORIZATION",
  IDPAY_PAYMENT_RESULT: "IDPAY_PAYMENT_RESULT"
} as const;

export type IDPayPaymentParamsList = {
  [IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT]: undefined;
  [IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: IDPayPaymentAuthorizationScreenRouteParams;
  [IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT]: undefined;
};

const Stack = createStackNavigator<IDPayPaymentParamsList>();

export const IDPayPaymentNavigator = () => (
  <IDPayPaymentMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name={IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
        component={IDPayPaymentCodeInputScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION}
        component={IDPayPaymentAuthorizationScreen}
      />
      <Stack.Screen
        name={IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT}
        component={IDPayPaymentResultScreen}
      />
    </Stack.Navigator>
  </IDPayPaymentMachineProvider>
);

export type IDPayPaymentStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayPaymentStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayPaymentStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<IDPayPaymentParamsList & ParamList, RouteName>;

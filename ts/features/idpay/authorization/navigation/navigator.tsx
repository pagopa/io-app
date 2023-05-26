import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { IDPayAuthorizationCodeScanScreen } from "../screens/IDPayAuthorizationCodeScanScreen";
import { IDPayAuthorizationCodeInputScreen } from "../screens/IDPayAuthorizationCodeInputScreen";
import { IDPayAuthorizationConfirmScreen } from "../screens/IDPayAuthorizationConfirmScreen";
import { IDPayAuthorizationResultScreen } from "../screens/IDPayAuthorizationResultScreen";
import { IDPayAuthorizationMachineProvider } from "../xstate/provider";

export const IDPayAuthorizationRoutes = {
  IDPAY_AUTHORIZATION_MAIN: "IDPAY_AUTHORIZATION_MAIN",
  IDPAY_AUTHORIZATION_CODE_SCAN: "IDPAY_AUTHORIZATION_CODE_SCAN",
  IDPAY_AUTHORIZATION_CODE_INPUT: "IDPAY_AUTHORIZATION_CODE_INPUT",
  IDPAY_AUTHORIZATION_CONFIRM: "IDPAY_AUTHORIZATION_CONFIRM",
  IDPAY_AUTHORIZATION_RESULT: "IDPAY_AUTHORIZATION_RESULT"
} as const;

export type IDPayAuthorizationParamsList = {
  [IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CODE_SCAN]: undefined;
  [IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CODE_INPUT]: undefined;
  [IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CONFIRM]: undefined;
  [IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_RESULT]: undefined;
};

const Stack = createStackNavigator<IDPayAuthorizationParamsList>();

export const IDPayAuthorizationNavigator = () => (
  <IDPayAuthorizationMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CODE_SCAN}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CODE_SCAN}
        component={IDPayAuthorizationCodeScanScreen}
      />
      <Stack.Screen
        name={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CODE_INPUT}
        component={IDPayAuthorizationCodeInputScreen}
      />
      <Stack.Screen
        name={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CONFIRM}
        component={IDPayAuthorizationConfirmScreen}
      />
      <Stack.Screen
        name={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_RESULT}
        component={IDPayAuthorizationResultScreen}
      />
    </Stack.Navigator>
  </IDPayAuthorizationMachineProvider>
);
export type IDPayAuthorizationStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayAuthorizationStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayAuthorizationStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<IDPayAuthorizationParamsList & ParamList, RouteName>;

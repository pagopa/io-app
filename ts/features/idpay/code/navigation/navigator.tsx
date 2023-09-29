import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { IdPayCodeDisplayScreen } from "../screens/IdPayCodeDisplayScreen";
import { IdPayCodeOnboardingScreen } from "../screens/IdPayCodeOnboardingScreen";
import { IdPayCodeRenewScreen } from "../screens/IdPayCodeRenewScreen";
import { IdPayCodeResultScreen } from "../screens/IdPayCodeResultScreen";
import { IdPayCodeParamsList } from "./params";
import { IdPayCodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayCodeParamsList>();

export const IdPayCodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: false }}
  >
    <Stack.Screen
      name={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
      component={IdPayCodeOnboardingScreen}
      options={{ gestureEnabled: true }}
    />
    <Stack.Screen
      name={IdPayCodeRoutes.IDPAY_CODE_DISPLAY}
      component={IdPayCodeDisplayScreen}
    />
    <Stack.Screen
      name={IdPayCodeRoutes.IDPAY_CODE_RENEW}
      component={IdPayCodeRenewScreen}
    />
    <Stack.Screen
      name={IdPayCodeRoutes.IDPAY_CODE_RESULT}
      component={IdPayCodeResultScreen}
    />
  </Stack.Navigator>
);

export type IdPayCodeStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IdPayCodeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IdPayCodeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList, RouteName>;

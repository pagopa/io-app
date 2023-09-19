import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { IDPayCodeDisplayScreen } from "../screens/IDPayCodeDisplayScreen";
import { IDPayCodeLandingScreen } from "../screens/IDPayCodeLandingScreen";
import { IDPayCodeResultScreen } from "../screens/IDPayCodeResultScreen";
import { IDPayCodeParamsList } from "./params";
import { IDPayCodeRoutes } from "./routes";

const Stack = createStackNavigator<IDPayCodeParamsList>();

export const IDPayCodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={IDPayCodeRoutes.IDPAY_CODE_LANDING}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: false }}
  >
    <Stack.Screen
      name={IDPayCodeRoutes.IDPAY_CODE_LANDING}
      component={IDPayCodeLandingScreen}
      options={{ gestureEnabled: true }}
    />
    <Stack.Screen
      name={IDPayCodeRoutes.IDPAY_CODE_DISPLAY}
      component={IDPayCodeDisplayScreen}
    />
    <Stack.Screen
      name={IDPayCodeRoutes.IDPAY_CODE_RESULT}
      component={IDPayCodeResultScreen}
    />
  </Stack.Navigator>
);

export type IDPayCodeStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayCodeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayCodeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList, RouteName>;

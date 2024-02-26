import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletDetailsScreen, {
  WalletDetailsScreenNavigationParams
} from "../screens/WalletDetailsScreen";

export const WalletDetailsRoutes = {
  WALLET_DETAILS_MAIN: "WALLET_DETAILS_MAIN",
  WALLET_DETAILS_SCREEN: "WALLET_DETAILS_SCREEN"
} as const;

export type WalletDetailsParamsList = {
  [WalletDetailsRoutes.WALLET_DETAILS_MAIN]: undefined;
  [WalletDetailsRoutes.WALLET_DETAILS_SCREEN]: WalletDetailsScreenNavigationParams;
};

const Stack = createStackNavigator<WalletDetailsParamsList>();

export const WalletDetailsNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletDetailsRoutes.WALLET_DETAILS_SCREEN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={WalletDetailsRoutes.WALLET_DETAILS_SCREEN}
      component={WalletDetailsScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

export type WalletDetailsStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletDetailsParamsList & ParamList, RouteName>;

export type WalletDetailsStackNavigation = WalletDetailsStackNavigationProp<
  WalletDetailsParamsList,
  keyof WalletDetailsParamsList
>;

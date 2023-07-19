import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletOnboardingStartScreen from "../screens/WalletOnboardingStartScreen";

export const WalletOnboardingRoutes = {
  WALLET_ONBOARDING_MAIN: "WALLET_ONBOARDING_MAIN",
  WALLET_ONBOARDING_START: "WALLET_ONBOARDING_START"
} as const;

export type WalletOnboardingParamsList = {
  [WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN]: undefined;
  [WalletOnboardingRoutes.WALLET_ONBOARDING_START]: undefined;
};

const Stack = createStackNavigator<WalletOnboardingParamsList>();

export const WalletOnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletOnboardingRoutes.WALLET_ONBOARDING_START}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletOnboardingRoutes.WALLET_ONBOARDING_START}
      component={WalletOnboardingStartScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

export type WalletOnboardingStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletOnboardingParamsList & ParamList, RouteName>;

export type WalletOnboardingStackNavigation =
  WalletOnboardingStackNavigationProp<
    WalletOnboardingParamsList,
    keyof WalletOnboardingParamsList
  >;

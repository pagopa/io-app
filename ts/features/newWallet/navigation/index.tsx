import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { WalletCardOnboardingScreen } from "../screens/WalletCardOnboardingScreen";

// TODO remove `NEW_` prefix after legacy wallet removal
// The prefix is to make the route name unique across all navigation routes
export const WalletRoutes = {
  WALLET_NAVIGATOR: "NEW_WALLET_NAVIGATOR",
  WALLET_CARD_ONBOARDING: "NEW_WALLET_CARD_ONBOARDING"
} as const;

export type WalletParamsList = {
  [WalletRoutes.WALLET_CARD_ONBOARDING]: undefined;
};

const Stack = createStackNavigator<WalletParamsList>();

export const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletRoutes.WALLET_CARD_ONBOARDING}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={WalletRoutes.WALLET_CARD_ONBOARDING}
      component={WalletCardOnboardingScreen}
    />
  </Stack.Navigator>
);

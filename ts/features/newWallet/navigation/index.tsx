import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { WalletCardOnboardingScreen } from "../screens/WalletCardOnboardingScreen";
import { WalletRoutes } from "./routes";
import { WalletParamsList } from "./params";

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

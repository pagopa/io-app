import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletOnboardingStartScreen, {
  WalletOnboardingFeedbackScreenParams
} from "../screens/WalletOnboardingFeedbackScreen";
import WalletOnboardingSelectPaymentMethodScreen from "../screens/WalletOnboardingSelectPaymentMethodScreen";

export const WalletOnboardingRoutes = {
  WALLET_ONBOARDING_MAIN: "WALLET_ONBOARDING_MAIN",
  WALLET_ONBOARDING_SELECT_PAYMENT_METHOD:
    "WALLET_ONBOARDING_SELECT_PAYMENT_METHOD",
  WALLET_ONBOARDING_RESULT_FEEDBACK: "WALLET_ONBOARDING_RESULT_FEEDBACK"
} as const;

export type WalletOnboardingParamsList = {
  [WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN]: undefined;
  [WalletOnboardingRoutes.WALLET_ONBOARDING_RESULT_FEEDBACK]: WalletOnboardingFeedbackScreenParams;
  [WalletOnboardingRoutes.WALLET_ONBOARDING_SELECT_PAYMENT_METHOD]: undefined;
};

const Stack = createStackNavigator<WalletOnboardingParamsList>();

export const WalletOnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletOnboardingRoutes.WALLET_ONBOARDING_RESULT_FEEDBACK}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={WalletOnboardingRoutes.WALLET_ONBOARDING_RESULT_FEEDBACK}
      component={WalletOnboardingStartScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name={WalletOnboardingRoutes.WALLET_ONBOARDING_SELECT_PAYMENT_METHOD}
      component={WalletOnboardingSelectPaymentMethodScreen}
      options={{ gestureEnabled: false, headerShown: true }}
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

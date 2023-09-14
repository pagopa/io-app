import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";

import * as React from "react";
import { View } from "react-native";
import { IDPayCIEOnboardingMachineProvider } from "./xstate/provider";

export const IDPayCIEOnboardingRoutes = {
  IDPAY_CIE_ONBOARDING_MAIN: "IDPAY_CIE_ONBOARDING_MAIN",
  IDPAY_CIE_ONBOARDING_INTRO: "IDPAY_CIE_ONBOARDING_INTRO",
  IDPAY_CIE_ONBOARDING_END: "IDPAY_CIE_ONBOARDING_END",
  IDPAY_CIE_ONBOARDING_RESULT: "IDPAY_CIE_ONBOARDING_CODE_RESULT"
} as const;

export type IDPayCIEOnboardingParamsList = {
  [IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_INTRO]: undefined;
  [IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_END]: undefined;
  [IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_RESULT]: undefined;
};

const Stack = createStackNavigator<IDPayCIEOnboardingParamsList>();

export const IDPayCIEOnboardingNavigator = () => (
  <IDPayCIEOnboardingMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_INTRO}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name={IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_INTRO}
        component={MockScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_END}
        component={MockScreen}
      />
      <Stack.Screen
        name={IDPayCIEOnboardingRoutes.IDPAY_CIE_ONBOARDING_RESULT}
        component={MockScreen}
      />
    </Stack.Navigator>
  </IDPayCIEOnboardingMachineProvider>
);

const MockScreen = () => <View></View>;

export type IDPayCIEOnboardingStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayCIEOnboardingStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayCIEOnboardingStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList, RouteName>;

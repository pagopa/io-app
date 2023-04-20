import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import BoolValuePrerequisitesScreen from "../screens/BoolValuePrerequisitesScreen";
import CompletionScreen from "../screens/CompletionScreen";
import FailureScreen from "../screens/FailureScreen";
import InitiativeDetailsScreen, {
  InitiativeDetailsScreenRouteParams
} from "../screens/InitiativeDetailsScreen";
import MultiValuePrerequisitesScreen from "../screens/MultiValuePrerequisitesScreen";
import PDNDPrerequisitesScreen from "../screens/PDNDPrerequisitesScreen";
import { IDPayOnboardingMachineProvider } from "../xstate/provider";

export const IDPayOnboardingRoutes = {
  IDPAY_ONBOARDING_MAIN: "IDPAY_ONBOARDING_MAIN",
  IDPAY_ONBOARDING_INITIATIVE_DETAILS: "IDPAY_ONBOARDING_INITIATIVE_DETAILS",
  IDPAY_ONBOARDING_PDNDACCEPTANCE: "IDPAY_ONBOARDING_PDNDACCEPTANCE",
  IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS: "IDPAY_ONBOARDING_SELF_DECLARATIONS",
  IDPAY_ONBOARDING_COMPLETION: "IDPAY_ONBOARDING_COMPLETION",
  IDPAY_ONBOARDING_FAILURE: "IDPAY_ONBOARDING_FAILURE",
  IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS:
    "IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS"
} as const;

export type IDPayOnboardingParamsList = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: InitiativeDetailsScreenRouteParams;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS]: undefined;
};

const Stack = createStackNavigator<IDPayOnboardingParamsList>();

export const IDPayOnboardingNavigator = () => (
  <IDPayOnboardingMachineProvider>
    <Stack.Navigator
      initialRouteName={
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
      }
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS}
        component={InitiativeDetailsScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS}
        component={BoolValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS}
        component={MultiValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE}
        component={PDNDPrerequisitesScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION}
        component={CompletionScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE}
        component={FailureScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  </IDPayOnboardingMachineProvider>
);
export type IDPayOnboardingStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayOnboardingStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayOnboardingStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<IDPayOnboardingParamsList & ParamList, RouteName>;

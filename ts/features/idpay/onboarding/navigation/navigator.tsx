import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InitiativeDetailsScreen, {
  InitiativeDetailsScreenRouteParams
} from "../screens/InitiativeDetailsScreen";
import { IDPayOnboardingMachineProvider } from "../xstate/provider";
import InitiativeSelfDeclarationsScreen from "../screens/InitiativeSelfDeclarationsScreen";
import PDNDPrerequisitesScreen from "../screens/PDNDPrerequisitesScreen";
import CompletionScreen from "../screens/CompletionScreen";
import FailureScreen from "../screens/FailureScreen";

export const IDPayOnboardingRoutes = {
  IDPAY_ONBOARDING_MAIN: "IDPAY_ONBOARDING_MAIN",
  IDPAY_ONBOARDING_INITIATIVE_DETAILS: "IDPAY_ONBOARDING_INITIATIVE_DETAILS",
  IDPAY_ONBOARDING_PDNDACCEPTANCE: "IDPAY_ONBOARDING_PDNDACCEPTANCE",
  IDPAY_ONBOARDING_SELF_DECLARATIONS: "IDPAY_ONBOARDING_SELF_DECLARATIONS",
  IDPAY_ONBOARDING_COMPLETION: "IDPAY_ONBOARDING_COMPLETION",
  IDPAY_ONBOARDING_FAILURE: "IDPAY_ONBOARDING_FAILURE"
} as const;

export type IDPayOnboardingParamsList = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: InitiativeDetailsScreenRouteParams;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_SELF_DECLARATIONS]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION]: undefined;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE]: undefined;
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
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_SELF_DECLARATIONS}
        component={InitiativeSelfDeclarationsScreen}
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

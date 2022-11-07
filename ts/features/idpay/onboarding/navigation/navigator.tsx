import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InitiativeDetailsScreen, {
  InitiativeDetailsScreenRouteParams
} from "../screens/InitiativeDetailScreen";
import { IDPayOnboardingMachineProvider } from "../xstate/provider";
import InitiativeSelfDeclarationsScreen, {
  InitiativeSelfDeclarationsScreenRouteParams
} from "../screens/InitiativeSelfDeclarationsScreen";

export const IDPayOnboardingRoutes = {
  IDPAY_ONBOARDING_MAIN: "IDPAY_ONBOARDING_MAIN",
  IDPAY_ONBOARDING_INITIATIVE_DETAILS: "IDPAY_ONBOARDING_INITIATIVE_DETAILS",
  IDPAY_ONBOARDING_SELF_DECLARATIONS: "IDPAY_ONBOARDING_SELF_DECLARATIONS"
} as const;

export type IDPayOnboardingParamsList = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: InitiativeDetailsScreenRouteParams;
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_SELF_DECLARATIONS]: InitiativeSelfDeclarationsScreenRouteParams;
};

const Stack = createStackNavigator<IDPayOnboardingParamsList>();

export const IDPayOnboardingNavigator = () => (
  <IDPayOnboardingMachineProvider>
    <Stack.Navigator
      initialRouteName={
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
      }
    >
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS}
        component={InitiativeDetailsScreen}
      />
      <Stack.Screen
        name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_SELF_DECLARATIONS}
        component={InitiativeSelfDeclarationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </IDPayOnboardingMachineProvider>
);

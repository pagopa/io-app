import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InitiativeDetailsScreen, {
  InitiativeDetailsScreenRouteParams
} from "../screens/InitiativeDetailScreen";
import { IDPayOnboardingMachineProvider } from "../xstate/provider";

export const IDPayOnboardingRoutes = {
  IDPAY_ONBOARDING_MAIN: "IDPAY_ONBOARDING_MAIN",
  IDPAY_ONBOARDING_INITIATIVE_DETAILS: "IDPAY_ONBOARDING_INITIATIVE_DETAILS"
} as const;

export type IDPayOnboardingParamsList = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: InitiativeDetailsScreenRouteParams;
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
    </Stack.Navigator>
  </IDPayOnboardingMachineProvider>
);

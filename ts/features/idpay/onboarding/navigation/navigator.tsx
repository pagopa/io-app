import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import {
  IdPayOnboardingMachineContext,
  IdPayOnboardingMachineProvider
} from "../machine/provider";
import BoolValuePrerequisitesScreen from "../screens/BoolValuePrerequisitesScreen";
import CompletionScreen from "../screens/CompletionScreen";
import FailureScreen from "../screens/FailureScreen";
import { InitiativeDetailsScreen } from "../screens/InitiativeDetailsScreen";
import MultiValuePrerequisitesScreen from "../screens/MultiValuePrerequisitesScreen";
import PDNDPrerequisitesScreen from "../screens/PDNDPrerequisitesScreen";
import { IdPayOnboardingParamsList } from "./params";
import { IdPayOnboardingRoutes } from "./routes";

const Stack = createStackNavigator<IdPayOnboardingParamsList>();

export const IdPayOnboardingNavigator = () => (
  <IdPayOnboardingMachineProvider>
    <InnerNavigator />
  </IdPayOnboardingMachineProvider>
);

export const InnerNavigator = () => {
  const idPayOnboardingMachineRef = IdPayOnboardingMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={
        IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
      }
      screenOptions={{ gestureEnabled: isGestureEnabled }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          idPayOnboardingMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS}
        component={InitiativeDetailsScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS}
        component={BoolValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS}
        component={MultiValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE}
        component={PDNDPrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION}
        component={CompletionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE}
        component={FailureScreen}
        options={{ gestureEnabled: false, headerShown: false }}
      />
    </Stack.Navigator>
  );
};

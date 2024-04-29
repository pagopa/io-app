import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayOnboardingMachineProvider } from "../machine/provider";
import BoolValuePrerequisitesScreen from "../screens/BoolValuePrerequisitesScreen";
import CompletionScreen from "../screens/CompletionScreen";
import FailureScreen from "../screens/FailureScreen";
import InitiativeDetailsScreen from "../screens/InitiativeDetailsScreen";
import MultiValuePrerequisitesScreen from "../screens/MultiValuePrerequisitesScreen";
import PDNDPrerequisitesScreen from "../screens/PDNDPrerequisitesScreen";
import { IdPayOnboardingParamsList } from "./params";
import { IdPayOnboardingRoutes } from "./routes";

const Stack = createStackNavigator<IdPayOnboardingParamsList>();

type IdPayOnboardingRouteProps = RouteProp<
  IdPayOnboardingParamsList,
  "IDPAY_ONBOARDING_NAVIGATOR"
>;

export const IdPayOnboardingNavigator = () => {
  const { params } = useRoute<IdPayOnboardingRouteProps>();
  const { serviceId } = params;

  return (
    <IdPayOnboardingMachineProvider input={{ serviceId }}>
      <Stack.Navigator
        initialRouteName={
          IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
        }
        screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
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
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </IdPayOnboardingMachineProvider>
  );
};

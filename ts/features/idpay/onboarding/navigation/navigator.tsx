import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import {
  IdPayOnboardingMachineContext,
  IdPayOnboardingMachineProvider
} from "../machine/provider";
import IdPayBoolValuePrerequisitesScreen from "../screens/IdPayBoolValuePrerequisitesScreen";
import IdPayCompletionScreen from "../screens/IdPayCompletionScreen";
import IdPayFailureScreen from "../screens/IdPayFailureScreen";
import IdPayInputFormVerificationScreen from "../screens/IdPayInputFormVerificationScreen";
import { IdPayInitiativeDetailsScreen } from "../screens/IdPayInitiativeDetailsScreen";
import IdPayMultiValuePrerequisitesScreen from "../screens/IdPayMultiValuePrerequisitesScreen";
import IdPayPDNDPrerequisitesScreen from "../screens/IdPayPDNDPrerequisitesScreen";
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
        component={IdPayInitiativeDetailsScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS}
        component={IdPayBoolValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM}
        component={IdPayInputFormVerificationScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS}
        component={IdPayMultiValuePrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE}
        component={IdPayPDNDPrerequisitesScreen}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION}
        component={IdPayCompletionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE}
        component={IdPayFailureScreen}
        options={{ gestureEnabled: false, headerShown: false }}
      />
    </Stack.Navigator>
  );
};

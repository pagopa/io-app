import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import {
  IdPayOnboardingMachineContext,
  IdPayOnboardingMachineProvider
} from "../machine/provider";
import IdPayBoolValuePrerequisitesScreen from "../screens/IdPayBoolValuePrerequisitesScreen";
import IdPayCompletionScreen from "../screens/IdPayCompletionScreen";
import IdPayEnableMessageScreen from "../screens/IdPayEnableMessageScreen";
import IdPayEnableNotificationScreen from "../screens/IdPayEnableNotificationScreen";
import { IdPayFailToRetryScreen } from "../screens/IdPayFailToRetryScreen";
import IdPayFailureScreen from "../screens/IdPayFailureScreen";
import { IdPayInitiativeDetailsScreen } from "../screens/IdPayInitiativeDetailsScreen";
import IdPayInputFormVerificationScreen from "../screens/IdPayInputFormVerificationScreen";
import IdPayLoadingScreen from "../screens/IdPayLoadingScreen";
import IdPayMultiValuePrerequisitesScreen from "../screens/IdPayMultiValuePrerequisitesScreen";
import IdPayPDNDPrerequisitesScreen from "../screens/IdPayPDNDPrerequisitesScreen";
import { IdPayOnboardingParamsList } from "./params";
import { IdPayOnboardingRoutes } from "./routes";

const Stack = createStackNavigator<IdPayOnboardingParamsList>();

export const IdPayOnboardingNavigator = () => (
  <IdPayOnboardingMachineProvider>
    <IdPayFeatureFlagGuard>
      <InnerNavigator />
    </IdPayFeatureFlagGuard>
  </IdPayOnboardingMachineProvider>
);

const InnerNavigator = () => {
  const idPayOnboardingMachineRef = IdPayOnboardingMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={
        IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
      }
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          idPayOnboardingMachineRef.send({ type: "back" });
        }
      }}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        component={IdPayEnableMessageScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_MESSAGE}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        component={IdPayInitiativeDetailsScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS}
      />
      <Stack.Screen
        component={IdPayBoolValuePrerequisitesScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS}
      />
      <Stack.Screen
        component={IdPayInputFormVerificationScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM}
      />
      <Stack.Screen
        component={IdPayMultiValuePrerequisitesScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS}
      />
      <Stack.Screen
        component={IdPayPDNDPrerequisitesScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE}
      />
      <Stack.Screen
        component={IdPayCompletionScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        component={IdPayEnableNotificationScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_NOTIFICATIONS}
        options={{ gestureEnabled: false, headerShown: false }}
      />
      <Stack.Screen
        component={IdPayFailureScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE}
        options={{ gestureEnabled: false, headerShown: false }}
      />
      <Stack.Screen
        component={IdPayFailToRetryScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE_TO_RETRY}
        options={{ gestureEnabled: false, headerShown: false }}
      />

      <Stack.Screen
        component={IdPayLoadingScreen}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_LOADING}
        options={{ gestureEnabled: false, headerShown: false }}
      />
    </Stack.Navigator>
  );
};

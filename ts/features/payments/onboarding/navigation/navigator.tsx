import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import { PaymentsOnboardingFeedbackScreen } from "../screens/PaymentsOnboardingFeedbackScreen";
import { PaymentsOnboardingSelectMethodScreen } from "../screens/PaymentsOnboardingSelectMethodScreen";
import { PaymentsOnboardingParamsList } from "./params";
import { PaymentsOnboardingRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsOnboardingParamsList>();

export const PaymentsOnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={
      PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK
    }
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD}
      component={PaymentsOnboardingSelectMethodScreen}
      options={{ gestureEnabled: false, headerShown: true }}
    />
    <Stack.Screen
      name={PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK}
      component={PaymentsOnboardingFeedbackScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

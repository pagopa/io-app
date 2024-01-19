import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../utils/navigation";
import ValidateEmailScreen from "../screens/profile/mailCheck/ValidateEmailScreen";
import EmailAlreadyTakenScreen from "../screens/profile/mailCheck/EmailAlreadyTakenScreen";
import ROUTES from "./routes";

const Stack = createStackNavigator();
/**
 * The onboarding related stack of screens of the application.
 */
const CheckEmailNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.CHECK_EMAIL_NOT_VERIFIED}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={ROUTES.CHECK_EMAIL_NOT_VERIFIED}
      component={ValidateEmailScreen}
    />
    <Stack.Screen
      name={ROUTES.CHECK_EMAIL_ALREADY_TAKEN}
      component={EmailAlreadyTakenScreen}
    />
  </Stack.Navigator>
);

export default CheckEmailNavigator;

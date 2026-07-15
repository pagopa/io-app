import { createStackNavigator } from "@react-navigation/stack";

import ROUTES from "../../../navigation/routes";
import { isGestureEnabled } from "../../../utils/navigation";
import EmailAlreadyTakenScreen from "../screens/EmailAlreadyTakenScreen";
import ValidateEmailScreen from "../screens/ValidateEmailScreen";

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
      component={ValidateEmailScreen}
      name={ROUTES.CHECK_EMAIL_NOT_VERIFIED}
      options={{ headerShown: true }}
    />
    <Stack.Screen
      component={EmailAlreadyTakenScreen}
      name={ROUTES.CHECK_EMAIL_ALREADY_TAKEN}
      options={{ headerShown: true }}
    />
  </Stack.Navigator>
);

export default CheckEmailNavigator;

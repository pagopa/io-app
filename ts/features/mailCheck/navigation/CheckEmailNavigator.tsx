import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ValidateEmailScreen from "../screens/ValidateEmailScreen";
import EmailAlreadyTakenScreen from "../screens/EmailAlreadyTakenScreen";
import ROUTES from "../../../navigation/routes";

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
      options={{ headerShown: true }}
      name={ROUTES.CHECK_EMAIL_NOT_VERIFIED}
      component={ValidateEmailScreen}
    />
    <Stack.Screen
      options={{ headerShown: true }}
      name={ROUTES.CHECK_EMAIL_ALREADY_TAKEN}
      component={EmailAlreadyTakenScreen}
    />
  </Stack.Navigator>
);

export default CheckEmailNavigator;

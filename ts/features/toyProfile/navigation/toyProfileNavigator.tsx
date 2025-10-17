import { createStackNavigator } from "@react-navigation/stack";
import { ProfileHomeScreen } from "../screens/ProfileHomeScreen.tsx";
import { isGestureEnabled } from "../../../utils/navigation.ts";
import { ProfileWarnScreen } from "../screens/ProfileWarnScreen.tsx";
import { ProfileConfirmDeleteScreen } from "../screens/ProfileConfirmDeleteScreen.tsx";
import { TOY_PROFILE_ROUTES } from "./routes";
import { ToyProfileParamsList } from "./params.ts";

const Stack = createStackNavigator<ToyProfileParamsList>();

/**
 * A navigator for all the screens of the Settings section
 */
const ToyProfileNavigator = () => (
  <Stack.Navigator
    initialRouteName={TOY_PROFILE_ROUTES.PROFILE_MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={TOY_PROFILE_ROUTES.PROFILE_MAIN}
      component={ProfileHomeScreen}
    />
    <Stack.Screen
      name={TOY_PROFILE_ROUTES.PROFILE_WARN}
      component={ProfileWarnScreen}
    />
    <Stack.Screen
      name={TOY_PROFILE_ROUTES.PROFILE_CONFIRM_DELETE}
      component={ProfileConfirmDeleteScreen}
    />
  </Stack.Navigator>
);

export default ToyProfileNavigator;

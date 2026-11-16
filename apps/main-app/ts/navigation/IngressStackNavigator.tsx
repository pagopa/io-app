import { createStackNavigator } from "@react-navigation/stack";

import { IngressScreen } from "../features/ingress/screens/IngressScreen";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AppParamsList>();

/**
 * Wraps {@link IngressScreen} in its own stack navigator.
 *
 * React Navigation v7's `NavigationContainer` requires its child tree to be a
 * navigator (not a bare screen component). Rendering `IngressScreen` directly
 * causes the container to get stuck since it never settles on a valid
 * navigation state, leaving the app locked on the loading screen at startup.
 */
const IngressStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.INGRESS}
    screenOptions={{ headerShown: false, gestureEnabled: false }}
  >
    <Stack.Screen component={IngressScreen} name={ROUTES.INGRESS} />
  </Stack.Navigator>
);

export default IngressStackNavigator;

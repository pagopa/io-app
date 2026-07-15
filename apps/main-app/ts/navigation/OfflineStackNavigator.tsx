import { createStackNavigator } from "@react-navigation/stack";

import { OfflineFailureScreen } from "../components/error/OfflineFailure";
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { isGestureEnabled } from "../utils/navigation";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AppParamsList>();

const OfflineStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ITW_ROUTES.MAIN}
    screenOptions={{
      gestureEnabled: false,
      headerMode: "screen"
    }}
  >
    <Stack.Screen
      component={ItwStackNavigator}
      name={ITW_ROUTES.MAIN}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />

    <Stack.Screen
      component={OfflineFailureScreen}
      name={ROUTES.OFFLINE_FAILURE}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default OfflineStackNavigator;

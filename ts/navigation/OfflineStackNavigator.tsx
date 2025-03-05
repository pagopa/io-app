import { createStackNavigator } from "@react-navigation/stack";
import { NoConnectivityScreen } from "../features/connectivity/screen/NoConnectivityScreen";
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
      name={ITW_ROUTES.MAIN}
      component={ItwStackNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />

    <Stack.Screen
      name={ROUTES.NO_CONNECTIVITY}
      options={{ headerShown: false }}
      component={NoConnectivityScreen}
    />
  </Stack.Navigator>
);

export default OfflineStackNavigator;

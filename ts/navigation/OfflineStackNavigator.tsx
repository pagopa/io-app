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
      name={ITW_ROUTES.MAIN}
      component={ItwStackNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />

    <Stack.Screen
      name={ROUTES.OFFLINE_FAILURE}
      options={{ headerShown: false }}
      component={OfflineFailureScreen}
    />
  </Stack.Navigator>
);

export default OfflineStackNavigator;

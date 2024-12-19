import { createStackNavigator } from "@react-navigation/stack";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import AuthenticationNavigator from "./AuthenticationNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AppParamsList>();
const NotAuthenticatedStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.AUTHENTICATION}
    screenOptions={{ gestureEnabled: false, headerShown: false }}
  >
    <Stack.Screen
      name={ROUTES.AUTHENTICATION}
      component={AuthenticationNavigator}
    />

    <Stack.Group
      screenOptions={{ headerMode: "screen", presentation: "modal" }}
    >
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={ZendeskStackNavigator}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default NotAuthenticatedStackNavigator;

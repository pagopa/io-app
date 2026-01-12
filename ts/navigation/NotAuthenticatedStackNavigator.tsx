import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";
import AuthenticationNavigator from "../features/authentication/common/navigation/AuthenticationNavigator";
import { AUTHENTICATION_ROUTES } from "../features/authentication/common/navigation/routes";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { AppParamsList } from "./params/AppParamsList";

const Stack = createStackNavigator<AppParamsList>();
const NotAuthenticatedStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={AUTHENTICATION_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: false, headerShown: false }}
  >
    <Stack.Screen
      name={AUTHENTICATION_ROUTES.MAIN}
      component={AuthenticationNavigator}
    />

    <Stack.Group
      screenOptions={{
        headerMode: "screen",
        /* Avoid buggy modal behavior on Android */
        presentation: Platform.OS === "ios" ? "modal" : "card"
      }}
    >
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={ZendeskStackNavigator}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default NotAuthenticatedStackNavigator;

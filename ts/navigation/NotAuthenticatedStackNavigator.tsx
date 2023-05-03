import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";
import AuthenticationNavigator from "./AuthenticationNavigator";

const Stack = createStackNavigator<AppParamsList>();
const NotAuthenticatedStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.AUTHENTICATION}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: false }}
  >
    <Stack.Screen
      name={ROUTES.AUTHENTICATION}
      component={AuthenticationNavigator}
    />
  </Stack.Navigator>
);

export default NotAuthenticatedStackNavigator;

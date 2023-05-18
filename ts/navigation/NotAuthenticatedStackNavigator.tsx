import * as React from "react";
import {
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
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

    <Stack.Screen
      name={ZENDESK_ROUTES.MAIN}
      component={ZendeskStackNavigator}
      options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
    />
  </Stack.Navigator>
);

export default NotAuthenticatedStackNavigator;

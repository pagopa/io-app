import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import {
  FimsFlowHandlerScreen,
  FimsFlowHandlerScreenRouteParams
} from "../screens/FimsFlowHandlerScreen";

export const FIMS_SSO_ROUTES = {
  MAIN: "FIMS_SSO_MAIN",
  CONSENTS: "FIMS_SSO_CONSENTS"
} as const;

export type FimsSSOParamsList = {
  [FIMS_SSO_ROUTES.MAIN]: undefined;
  [FIMS_SSO_ROUTES.CONSENTS]: FimsFlowHandlerScreenRouteParams;
};

const Stack = createStackNavigator<FimsSSOParamsList>();

export const FimsSSONavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_SSO_ROUTES.MAIN}
    // Make sure to disable gestures in order to prevent
    // the user from going back by swiping and thus not
    // calling the custom cancel logic
    screenOptions={{ gestureEnabled: false, headerShown: true }}
  >
    <Stack.Screen
      name={FIMS_SSO_ROUTES.CONSENTS}
      component={FimsFlowHandlerScreen}
    />
  </Stack.Navigator>
);

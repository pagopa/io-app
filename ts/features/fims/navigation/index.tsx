import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import {
  FimsFlowHandlerScreen,
  FimsFlowHandlerScreenRouteParams
} from "../screens/FimsFlowHandlerScreen";

export const FIMS_ROUTES = {
  MAIN: "FIMS_MAIN",
  CONSENTS: "FIMS_CONSENTS"
} as const;

export type FimsParamsList = {
  [FIMS_ROUTES.MAIN]: undefined;
  [FIMS_ROUTES.CONSENTS]: FimsFlowHandlerScreenRouteParams;
};

const Stack = createStackNavigator<FimsParamsList>();

export const FimsNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_ROUTES.MAIN}
    // Make sure to disable gestures in order to prevent
    // the user from going back by swiping and thus not
    // calling the custom cancel logic
    screenOptions={{ gestureEnabled: false, headerShown: true }}
  >
    <Stack.Screen
      name={FIMS_ROUTES.CONSENTS}
      component={FimsFlowHandlerScreen}
    />
  </Stack.Navigator>
);

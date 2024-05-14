import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
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
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      name={FIMS_ROUTES.CONSENTS}
      component={FimsFlowHandlerScreen}
    />
  </Stack.Navigator>
);

import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { FimsHistoryScreen } from "../screens/HistoryScreen";

export const FIMS_HISTORY_ROUTES = {
  MAIN: "FIMS_HISTORY_MAIN",
  HISTORY: "FIMS_HISTORY_HISTORY"
} as const;

export type FimsHistoryParamsList = {
  [FIMS_HISTORY_ROUTES.MAIN]: undefined;
  [FIMS_HISTORY_ROUTES.HISTORY]: undefined;
};

const Stack = createStackNavigator<FimsHistoryParamsList>();

export const FimsHistoryNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_HISTORY_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: false, headerShown: true }}
  >
    <Stack.Screen
      name={FIMS_HISTORY_ROUTES.HISTORY}
      component={FimsHistoryScreen}
    />
  </Stack.Navigator>
);

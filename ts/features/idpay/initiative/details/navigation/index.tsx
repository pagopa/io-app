import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../../utils/navigation";
import {
  InitiativeDetailsScreen,
  InitiativeDetailsScreenParams
} from "../screens/InitiativeDetailsScreen";
import {
  OperationsListScreenParams,
  OperationsListScreen
} from "../screens/OperationsListScreen";

export const IDPayDetailsRoutes = {
  IDPAY_DETAILS_MAIN: "IDPAY_DETAILS_MAIN",
  IDPAY_DETAILS_MONITORING: "IDPAY_DETAILS_MONITORING",
  IDPAY_DETAILS_TIMELINE: "IDPAY_DETAILS_TIMELINE"
} as const;

export type IDPayDetailsParamsList = {
  [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: InitiativeDetailsScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE]: OperationsListScreenParams;
};

const Stack = createStackNavigator<IDPayDetailsParamsList>();

export const IDpayDetailsNavigator = () => (
  <Stack.Navigator
    initialRouteName={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
      component={InitiativeDetailsScreen}
    />
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE}
      component={OperationsListScreen}
    />
  </Stack.Navigator>
);

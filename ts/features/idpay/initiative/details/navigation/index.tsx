import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import BeneficiaryDetailsScreen from "../screens/BeneficiaryDetailsScreen";
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
  IDPAY_DETAILS_TIMELINE: "IDPAY_DETAILS_TIMELINE",
  IDPAY_DETAILS_BENEFICIARY: "IDPAY_DETAILS_BENEFICIARY"
} as const;

export type IDPayDetailsParamsList = {
  [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: InitiativeDetailsScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE]: OperationsListScreenParams;
  [IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY]: OperationsListScreenParams;
};

const Stack = createStackNavigator<IDPayDetailsParamsList>();

export const IDpayDetailsNavigator = () => (
  <Stack.Navigator
    initialRouteName={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING}
      component={InitiativeDetailsScreen}
    />
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_TIMELINE}
      component={OperationsListScreen}
    />
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY}
      component={BeneficiaryDetailsScreen}
    />
  </Stack.Navigator>
);

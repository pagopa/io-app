import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import UnsubscriptionConfirmationScreen, {
  IDPayUnsubscriptionConfirmationScreenParams
} from "../screens/UnsubscriptionConfirmationScreen";
import UnsubscriptionFailureScreen from "../screens/UnsubscriptionFailureScreen";
import UnsubscriptionSuccessScreen from "../screens/UnsubscriptionSuccessScreen";
import { IDPayUnsubscriptionMachineProvider } from "../xstate/provider";

export const IDPayUnsubscriptionRoutes = {
  IDPAY_UNSUBSCRIPTION_MAIN: "IDPAY_UNSUBSCRIPTION_MAIN",
  IDPAY_UNSUBSCRIPTION_CONFIRMATION: "IDPAY_UNSUBSCRIPTION_CONFIRMATION",
  IDPAY_UNSUBSCRIPTION_SUCCESS: "IDPAY_ONBOARDING_COMPLETION",
  IDPAY_UNSUBSCRIPTION_FAILURE: "IDPAY_UNSUBSCRIPTION_FAILURE"
} as const;

export type IDPayUnsubscriptionParamsList = {
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: IDPayUnsubscriptionConfirmationScreenParams;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE]: undefined;
};

const Stack = createStackNavigator<IDPayUnsubscriptionParamsList>();

export const IDPayUnsubscriptionNavigator = () => (
  <IDPayUnsubscriptionMachineProvider>
    <Stack.Navigator
      initialRouteName={
        IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
      }
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
        component={UnsubscriptionConfirmationScreen}
      />
      <Stack.Screen
        name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS}
        component={UnsubscriptionSuccessScreen}
      />
      <Stack.Screen
        name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE}
        component={UnsubscriptionFailureScreen}
      />
    </Stack.Navigator>
  </IDPayUnsubscriptionMachineProvider>
);

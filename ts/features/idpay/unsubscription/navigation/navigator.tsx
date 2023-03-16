import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import UnsubscriptionConfirmationScreen from "../screens/UnsubscriptionConfirmationScreen";
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
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]: IDPayUnsubscriptionNavigatorParams;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE]: undefined;
};

const Stack = createStackNavigator<IDPayUnsubscriptionParamsList>();

export type IDPayUnsubscriptionNavigatorParams = {
  initiativeId: string;
  initiativeName?: string;
};

type IDPayUnsubscriptionScreenRouteProps = RouteProp<
  IDPayUnsubscriptionParamsList,
  "IDPAY_UNSUBSCRIPTION_MAIN"
>;

export const IDPayUnsubscriptionNavigator = () => {
  const route = useRoute<IDPayUnsubscriptionScreenRouteProps>();

  const { initiativeId, initiativeName } = route.params;

  return (
    <IDPayUnsubscriptionMachineProvider
      initiativeId={initiativeId}
      initiativeName={initiativeName}
    >
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
};

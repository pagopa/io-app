import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import UnsubscriptionConfirmationScreen from "../screens/UnsubscriptionConfirmationScreen";
import UnsubscriptionResultScreen from "../screens/UnsubscriptionResultScreen";
import { IDPayUnsubscriptionMachineProvider } from "../xstate/provider";

export const IDPayUnsubscriptionRoutes = {
  IDPAY_UNSUBSCRIPTION_MAIN: "IDPAY_UNSUBSCRIPTION_MAIN",
  IDPAY_UNSUBSCRIPTION_CONFIRMATION: "IDPAY_UNSUBSCRIPTION_CONFIRMATION",
  IDPAY_UNSUBSCRIPTION_RESULT: "IDPAY_UNSUBSCRIPTION_RESULT"
} as const;

export type IDPayUnsubscriptionParamsList = {
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]: IDPayUnsubscriptionNavigatorParams;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT]: undefined;
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
        headerMode={"none"}
      >
        <Stack.Screen
          name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
          component={UnsubscriptionConfirmationScreen}
        />
        <Stack.Screen
          name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
          component={UnsubscriptionResultScreen}
        />
      </Stack.Navigator>
    </IDPayUnsubscriptionMachineProvider>
  );
};

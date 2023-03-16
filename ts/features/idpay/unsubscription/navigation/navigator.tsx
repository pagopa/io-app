import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import UnsubscriptionConfirmationScreen from "../screens/UnsubscriptionConfirmationScreen";
import UnsubscriptionResultScreen from "../screens/UnsubscriptionResultScreen";
import { IDPayUnsubscriptionMachineProvider } from "../xstate/provider";
import { IDPayUnsubscriptionParamsList } from "./params";
import { IDPayUnsubscriptionRoutes } from "./routes";

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
          name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
          component={UnsubscriptionResultScreen}
        />
      </Stack.Navigator>
    </IDPayUnsubscriptionMachineProvider>
  );
};

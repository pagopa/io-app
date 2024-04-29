import { RouteProp, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { IdPayUnsubscriptionMachineProvider } from "../machine/provider";
import UnsubscriptionConfirmationScreen from "../screens/UnsubscriptionConfirmationScreen";
import UnsubscriptionResultScreen from "../screens/UnsubscriptionResultScreen";
import { IdPayUnsubscriptionParamsList } from "./params";
import { IdPayUnsubscriptionRoutes } from "./routes";

const Stack = createStackNavigator<IdPayUnsubscriptionParamsList>();

type IdPayUnsubscriptionScreenRouteProps = RouteProp<
  IdPayUnsubscriptionParamsList,
  "IDPAY_UNSUBSCRIPTION_NAVIGATOR"
>;

export const IDPayUnsubscriptionNavigator = () => {
  const { params } = useRoute<IdPayUnsubscriptionScreenRouteProps>();
  const { initiativeId, initiativeName, initiativeType } = params;

  return (
    <IdPayUnsubscriptionMachineProvider
      input={{ initiativeId, initiativeName, initiativeType }}
    >
      <Stack.Navigator
        initialRouteName={
          IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
        }
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION}
          component={UnsubscriptionConfirmationScreen}
        />
        <Stack.Screen
          name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT}
          component={UnsubscriptionResultScreen}
        />
      </Stack.Navigator>
    </IdPayUnsubscriptionMachineProvider>
  );
};

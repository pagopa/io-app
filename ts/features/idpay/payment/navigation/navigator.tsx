import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import {
  IdPayPaymentMachineContext,
  IdPayPaymentMachineProvider
} from "../machine/provider";
import { IDPayPaymentAuthorizationScreen } from "../screens/IDPayPaymentAuthorizationScreen";
import { IDPayPaymentCodeInputScreen } from "../screens/IDPayPaymentCodeInputScreen";
import { IDPayPaymentResultScreen } from "../screens/IDPayPaymentResultScreen";
import { IdPayPaymentParamsList } from "./params";
import { IdPayPaymentRoutes } from "./routes";

const Stack = createStackNavigator<IdPayPaymentParamsList>();

export const IdPayPaymentNavigator = () => (
  <IdPayPaymentMachineProvider>
    <InnerNavigation />
  </IdPayPaymentMachineProvider>
);

const InnerNavigation = () => {
  const idPayPaymentMachineRef = IdPayPaymentMachineContext.useActorRef();

  return (
    <IdPayPaymentMachineProvider>
      <Stack.Navigator
        initialRouteName={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
        screenOptions={{ gestureEnabled: false, headerShown: false }}
        screenListeners={{
          beforeRemove: () => {
            // Read more on https://reactnavigation.org/docs/preventing-going-back/
            // Whenever we have a back navigation action we send a "back" event to the machine.
            // Since the back event is accepted only by specific states, we can safely send a back event to each machine
            idPayPaymentMachineRef.send({ type: "back" });
          }
        }}
      >
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
          component={IDPayPaymentCodeInputScreen}
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION}
          component={IDPayPaymentAuthorizationScreen}
        />
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT}
          component={IDPayPaymentResultScreen}
        />
      </Stack.Navigator>
    </IdPayPaymentMachineProvider>
  );
};

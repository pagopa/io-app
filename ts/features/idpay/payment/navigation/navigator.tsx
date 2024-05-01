import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { IdPayPaymentMachineProvider } from "../machine/provider";
import { IDPayPaymentAuthorizationScreen } from "../screens/IDPayPaymentAuthorizationScreen";
import { IDPayPaymentCodeInputScreen } from "../screens/IDPayPaymentCodeInputScreen";
import { IDPayPaymentResultScreen } from "../screens/IDPayPaymentResultScreen";
import { IdPayPaymentParamsList } from "./params";
import { IdPayPaymentRoutes } from "./routes";

const Stack = createStackNavigator<IdPayPaymentParamsList>();

export const IDPayPaymentNavigator = () => (
  <IdPayPaymentMachineProvider>
    <Stack.Navigator
      initialRouteName={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
      screenOptions={{ gestureEnabled: false, headerShown: false }}
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

import { createStackNavigator } from "@react-navigation/stack";

import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
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
    <IdPayFeatureFlagGuard>
      <InnerNavigation />
    </IdPayFeatureFlagGuard>
  </IdPayPaymentMachineProvider>
);

const InnerNavigation = () => {
  const idPayPaymentMachineRef = IdPayPaymentMachineContext.useActorRef();

  return (
    <IdPayPaymentMachineProvider>
      <Stack.Navigator
        initialRouteName={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
        screenListeners={{
          beforeRemove: () => {
            // Read more on https://reactnavigation.org/docs/preventing-going-back/
            // Whenever we have a back navigation action we send a "back" event to the machine.
            // Since the back event is accepted only by specific states, we can safely send a back event to each machine
            idPayPaymentMachineRef.send({ type: "back" });
          }
        }}
        screenOptions={{ gestureEnabled: false }}
      >
        <Stack.Screen
          component={IDPayPaymentCodeInputScreen}
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen
          component={IDPayPaymentAuthorizationScreen}
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION}
        />
        <Stack.Screen
          component={IDPayPaymentResultScreen}
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </IdPayPaymentMachineProvider>
  );
};

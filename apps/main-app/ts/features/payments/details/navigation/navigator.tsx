import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayInstrumentInitiativesScreen } from "../../../idpay/wallet/screens/IdPayInstrumentInitiativesScreen";
import PaymentsMethodDetailsScreen from "../screens/PaymentsMethodDetailsScreen";
import { PaymentsMethodDetailsParamsList } from "./params";
import { PaymentsMethodDetailsRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsMethodDetailsParamsList>();

export const PaymentsMethodDetailsNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      component={PaymentsMethodDetailsScreen}
      name={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      component={IdPayInstrumentInitiativesScreen}
      name={PaymentsMethodDetailsRoutes.IDPAY_INITIATIVE_DETAILS_LIST}
    />
  </Stack.Navigator>
);

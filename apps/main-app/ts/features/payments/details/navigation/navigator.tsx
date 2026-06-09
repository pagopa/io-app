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
      name={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN}
      component={PaymentsMethodDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      name={PaymentsMethodDetailsRoutes.IDPAY_INITIATIVE_DETAILS_LIST}
      component={IdPayInstrumentInitiativesScreen}
    />
  </Stack.Navigator>
);

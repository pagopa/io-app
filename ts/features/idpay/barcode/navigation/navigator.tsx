import { createStackNavigator } from "@react-navigation/stack";
import { IdPayBarcodeResultScreen } from "../screens/IdPayBarcodeResultScreen";
import { IdPayBarcodeParamsList } from "./params";
import { IdPayBarcodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayBarcodeParamsList>();
export const IdPayBarcodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
    screenOptions={{ gestureEnabled: true, headerShown: false }}
  >
    <Stack.Screen
      name={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
      component={IdPayBarcodeResultScreen}
    />
  </Stack.Navigator>
);

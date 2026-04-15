import { createStackNavigator } from "@react-navigation/stack";
import { IdPayBarcodeResultScreen } from "../screens/IdPayBarcodeResultScreen";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import { IdPayBarcodeParamsList } from "./params";
import { IdPayBarcodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayBarcodeParamsList>();
export const IdPayBarcodeNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
      screenOptions={{ gestureEnabled: true }}
    >
      <Stack.Screen
        name={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
        component={IdPayBarcodeResultScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);

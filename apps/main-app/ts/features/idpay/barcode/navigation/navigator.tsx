import { createStackNavigator } from "@react-navigation/stack";

import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import { IdPayBarcodeResultScreen } from "../screens/IdPayBarcodeResultScreen";
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
        component={IdPayBarcodeResultScreen}
        name={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);

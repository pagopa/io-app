import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { IdPayBarcodeRoutes } from "./routes";
import { IdPayBarcodeParamsList } from "./params";

const Stack = createStackNavigator<IdPayBarcodeParamsList>();
export const IdPayBarcodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: true }}
  >
    <Stack.Screen
      name={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
      component={MockScreen}
    />
  </Stack.Navigator>
);

const MockScreen = () => <></>;

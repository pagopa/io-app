import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";

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

export const IdPayBarcodeRoutes = {
  IDPAY_BARCODE_MAIN: "IDPAY_BARCODE_MAIN",
  IDPAY_BARCODE_RESULT: "IDPAY_BARCODE_RESULT"
} as const;
export type IdPayBarcodeParamsList = {
  [IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN]: undefined;
  [IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT]: undefined;
};

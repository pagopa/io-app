import {
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { Platform } from "react-native";
import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayBarcodeResultScreen } from "../screens/IdPayBarcodeResultScreen";
import { IdPayBarcodeParamsList } from "./params";
import { IdPayBarcodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayBarcodeParamsList>();
export const IdPayBarcodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
    headerMode={"none"}
    mode="modal"
    screenOptions={
      Platform.OS === "ios"
        ? {
            gestureEnabled: isGestureEnabled,
            cardOverlayEnabled: true,
            ...TransitionPresets.ModalPresentationIOS
          }
        : {}
    }
  >
    <Stack.Screen
      name={IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT}
      component={IdPayBarcodeResultScreen}
    />
  </Stack.Navigator>
);

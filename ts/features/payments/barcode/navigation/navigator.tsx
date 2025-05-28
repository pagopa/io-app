import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
  TransitionPresets
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import { PaymentsBarcodeChoiceScreen } from "../screens/PaymentsBarcodeChoiceScreen";
import { PaymentsBarcodeScanScreen } from "../screens/PaymentsBarcodeScanScreen";
import { PaymentsBarcodeParamsList } from "./params";
import { PaymentsBarcodeRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsBarcodeParamsList>();

export const WalletBarcodeNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN}
      component={PaymentsBarcodeScanScreen}
      options={{
        ...TransitionPresets.ModalSlideFromBottomIOS,
        headerShown: false,
        gestureEnabled: isGestureEnabled
      }}
    />
    <Stack.Screen
      name={PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE}
      component={PaymentsBarcodeChoiceScreen}
      options={{
        gestureEnabled: isGestureEnabled
      }}
    />
  </Stack.Navigator>
);

export type PaymentsBarcodeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsBarcodeParamsList & ParamList, RouteName>;

export type PaymentsBarcodeStackNavigation = PaymentsBarcodeStackNavigationProp<
  PaymentsBarcodeParamsList,
  keyof PaymentsBarcodeParamsList
>;

import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import WalletTransactionCartItemDetailsScreen from "../screens/ReceiptCartItemDetailsScreen";
import { ReceiptDetailsScreen } from "../screens/ReceiptDetailsScreen";
import ReceiptDownloadErrorScreen from "../screens/ReceiptDownloadErrorScreen";
import { ReceiptListScreen } from "../screens/ReceiptListScreen";
import ReceiptPreviewScreen from "../screens/ReceiptPreviewScreen";
import { PaymentsReceiptParamsList } from "./params";
import { PaymentsReceiptRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsReceiptParamsList>();

export const PaymentsReceiptNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      component={ReceiptDetailsScreen}
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      component={WalletTransactionCartItemDetailsScreen}
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_CART_ITEM_DETAILS}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      component={ReceiptListScreen}
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_LIST_SCREEN}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      component={ReceiptPreviewScreen}
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_PREVIEW_SCREEN}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      component={ReceiptDownloadErrorScreen}
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_ERROR_SCREEN}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
  </Stack.Navigator>
);

export type ReceiptStackNavigation = ReceiptStackNavigationProp<
  PaymentsReceiptParamsList,
  keyof PaymentsReceiptParamsList
>;

type ReceiptStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList & PaymentsReceiptParamsList, RouteName>;

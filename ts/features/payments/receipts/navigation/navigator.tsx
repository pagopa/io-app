import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletTransactionCartItemDetailsScreen from "../screens/ReceiptCartItemDetailsScreen";
import { ReceiptDetailsScreen } from "../screens/ReceiptDetailsScreen";
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
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS}
      component={ReceiptDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_CART_ITEM_DETAILS}
      component={WalletTransactionCartItemDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_LIST_SCREEN}
      component={ReceiptListScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_PREVIEW_SCREEN}
      component={ReceiptPreviewScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
  </Stack.Navigator>
);

type ReceiptStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsReceiptParamsList & ParamList, RouteName>;

export type ReceiptStackNavigation = ReceiptStackNavigationProp<
  PaymentsReceiptParamsList,
  keyof PaymentsReceiptParamsList
>;

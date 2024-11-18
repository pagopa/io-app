import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { PaymentsTransactionBizEventsDetailsScreen } from "../screens/PaymentsTransactionBizEventsDetailsScreen";
import { PaymentsTransactionBizEventsListScreen } from "../screens/PaymentsTransactionBizEventsListScreen";
import WalletTransactionCartItemDetailsScreen from "../screens/PaymentsTransactionBizEventsCartItemDetailsScreen";
import PaymentsTransactionBizEventsPreviewScreen from "../screens/PaymentsTransactionBizEventsPreviewScreen";
import { PaymentsTransactionBizEventsParamsList } from "./params";
import { PaymentsTransactionBizEventsRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsTransactionBizEventsParamsList>();

export const PaymentsTransactionBizEventsNavigator = () => (
  <Stack.Navigator
    initialRouteName={
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS
    }
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      name={
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS
      }
      component={PaymentsTransactionBizEventsDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_CART_ITEM_DETAILS
      }
      component={WalletTransactionCartItemDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_LIST_SCREEN
      }
      component={PaymentsTransactionBizEventsListScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_PREVIEW_SCREEN
      }
      component={PaymentsTransactionBizEventsPreviewScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
  </Stack.Navigator>
);

export type PaymentsTransactionBizEventsStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<
  PaymentsTransactionBizEventsParamsList & ParamList,
  RouteName
>;

export type PaymentsTransactionBizEventsStackNavigation =
  PaymentsTransactionBizEventsStackNavigationProp<
    PaymentsTransactionBizEventsParamsList,
    keyof PaymentsTransactionBizEventsParamsList
  >;

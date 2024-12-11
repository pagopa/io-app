import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletTransactionCartItemDetailsScreen from "../screens/NoticeCartItemDetailsScreen";
import { NoticeDetailsScreen } from "../screens/NoticeDetailsScreen";
import { PaymentsNoticeListScreen } from "../screens/NoticeListScreen";
import PaymentsNoticePreviewScreen from "../screens/NoticePreviewScreen";
import { PaymentsNoticeParamsList } from "./params";
import { PaymentsNoticeRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsNoticeParamsList>();

export const PaymentsNoticeNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsNoticeRoutes.PAYMENT_NOTICE_DETAILS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      name={PaymentsNoticeRoutes.PAYMENT_NOTICE_DETAILS}
      component={NoticeDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsNoticeRoutes.PAYMENT_NOTICE_CART_ITEM_DETAILS}
      component={WalletTransactionCartItemDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsNoticeRoutes.PAYMENT_NOTICE_LIST_SCREEN}
      component={PaymentsNoticeListScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsNoticeRoutes.PAYMENT_NOTICE_PREVIEW_SCREEN}
      component={PaymentsNoticePreviewScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
  </Stack.Navigator>
);

export type PaymentsTransactionBizEventsStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsNoticeParamsList & ParamList, RouteName>;

export type PaymentsNoticeStackNavigation =
  PaymentsTransactionBizEventsStackNavigationProp<
    PaymentsNoticeParamsList,
    keyof PaymentsNoticeParamsList
  >;

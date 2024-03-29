import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import { PaymentsTransactionDetailsScreen } from "../screens/PaymentsTransactionDetailsScreen";
import WalletTransactionOperationDetailsScreen from "../screens/PaymentsTransactionOperationDetails";
import { PaymentsTransactionParamsList } from "./params";
import { PaymentsTransactionRoutes } from "./routes";

const Stack = createStackNavigator<PaymentsTransactionParamsList>();

export const PaymentsTransactionNavigator = () => (
  <Stack.Navigator
    initialRouteName={PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_DETAILS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      name={PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_DETAILS}
      component={PaymentsTransactionDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
    <Stack.Screen
      name={PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_OPERATION_DETAILS}
      component={WalletTransactionOperationDetailsScreen}
      options={{ gestureEnabled: isGestureEnabled }}
    />
  </Stack.Navigator>
);

export type PaymentsTransactionStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<PaymentsTransactionParamsList & ParamList, RouteName>;

export type PaymentsTransactionStackNavigation =
  PaymentsTransactionStackNavigationProp<
    PaymentsTransactionParamsList,
    keyof PaymentsTransactionParamsList
  >;

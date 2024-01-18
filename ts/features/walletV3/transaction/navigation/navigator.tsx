import { ParamListBase } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import WalletTransactionDetailsScreen, {
  WalletTransactionDetailsScreenParams
} from "../screens/WalletTransactionDetailsScreen";
import WalletTransactionOperationDetailsScreen, {
  WalletTransactionOperationDetailsScreenParams
} from "../screens/WalletTransactionOperationDetails";

export const WalletTransactionRoutes = {
  WALLET_TRANSACTION_MAIN: "WALLET_TRANSACTION_MAIN",
  WALLET_TRANSACTION_DETAILS: "WALLET_TRANSACTION_DETAILS",
  WALLET_TRANSACTION_OPERATION_DETAILS: "WALLET_TRANSACTION_OPERATION_DETAILS"
} as const;

export type WalletTransactionParamsList = {
  [WalletTransactionRoutes.WALLET_TRANSACTION_MAIN]: undefined;
  [WalletTransactionRoutes.WALLET_TRANSACTION_DETAILS]: WalletTransactionDetailsScreenParams;
  [WalletTransactionRoutes.WALLET_TRANSACTION_OPERATION_DETAILS]: WalletTransactionOperationDetailsScreenParams;
};

const Stack = createStackNavigator<WalletTransactionParamsList>();

export const WalletTransactionNavigator = () => (
  <Stack.Navigator
    initialRouteName={WalletTransactionRoutes.WALLET_TRANSACTION_DETAILS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={WalletTransactionRoutes.WALLET_TRANSACTION_DETAILS}
      component={WalletTransactionDetailsScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name={WalletTransactionRoutes.WALLET_TRANSACTION_OPERATION_DETAILS}
      component={WalletTransactionOperationDetailsScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

export type WalletTransactionStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<WalletTransactionParamsList & ParamList, RouteName>;

export type WalletTransactionStackNavigation =
  WalletTransactionStackNavigationProp<
    WalletTransactionParamsList,
    keyof WalletTransactionParamsList
  >;

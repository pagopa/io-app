import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { mvlEnabled } from "../config";
import { EUCovidCertStackNavigator } from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { MvlStackNavigator } from "../features/mvl/navigation/navigator";
import MVL_ROUTES from "../features/mvl/navigation/routes";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
import PaginatedMessageDetailScreen from "../screens/messages/paginated/MessageDetailScreen";
import PaginatedMessageRouterScreen from "../screens/messages/paginated/MessageRouterScreen";
import { PnStackNavigator } from "../features/pn/navigation/navigator";
import PN_ROUTES from "../features/pn/navigation/routes";
import { useIOSelector } from "../store/hooks";
import { areGestureEnabled } from "../utils/navigation";
import { isPnEnabledSelector } from "../store/reducers/backendStatus";
import { MessagesParamsList } from "./params/MessagesParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

export const MessagesStackNavigator = () => {
  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MESSAGE_ROUTER}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: areGestureEnabled }}
    >
      <Stack.Screen
        name={ROUTES.MESSAGE_ROUTER}
        component={MessageRouterScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_DETAIL}
        component={MessageDetailScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_ROUTER_PAGINATED}
        component={PaginatedMessageRouterScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_DETAIL_PAGINATED}
        component={PaginatedMessageDetailScreen}
      />

      <Stack.Screen
        name={EUCOVIDCERT_ROUTES.MAIN}
        component={EUCovidCertStackNavigator}
      />

      {mvlEnabled && (
        <Stack.Screen name={MVL_ROUTES.MAIN} component={MvlStackNavigator} />
      )}

      {isPnEnabled && (
        <Stack.Screen name={PN_ROUTES.MAIN} component={PnStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

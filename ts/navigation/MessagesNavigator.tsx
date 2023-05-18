import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EUCovidCertStackNavigator } from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import PaginatedMessageDetailScreen from "../screens/messages/MessageDetailScreen";
import PaginatedMessageRouterScreen from "../screens/messages/MessageRouterScreen";
import { PnStackNavigator } from "../features/pn/navigation/navigator";
import PN_ROUTES from "../features/pn/navigation/routes";
import { useIOSelector } from "../store/hooks";
import { isGestureEnabled } from "../utils/navigation";
import { isPnEnabledSelector } from "../store/reducers/backendStatus";
import { MessageDetailAttachment } from "../screens/messages/MessageAttachment";
import { MessagesParamsList } from "./params/MessagesParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

export const MessagesStackNavigator = () => {
  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MESSAGE_ROUTER_PAGINATED}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={ROUTES.MESSAGE_ROUTER_PAGINATED}
        component={PaginatedMessageRouterScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_DETAIL_PAGINATED}
        component={PaginatedMessageDetailScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_DETAIL_ATTACHMENT}
        component={MessageDetailAttachment}
      />

      <Stack.Screen
        name={EUCOVIDCERT_ROUTES.MAIN}
        component={EUCovidCertStackNavigator}
      />

      {isPnEnabled && (
        <Stack.Screen name={PN_ROUTES.MAIN} component={PnStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

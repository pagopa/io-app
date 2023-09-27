import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EUCovidCertStackNavigator } from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
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
      initialRouteName={ROUTES.MESSAGE_ROUTER}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={ROUTES.MESSAGE_ROUTER}
        component={MessageRouterScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGE_DETAIL}
        component={MessageDetailScreen}
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

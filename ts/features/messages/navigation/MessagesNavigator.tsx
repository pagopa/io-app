import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EUCovidCertStackNavigator } from "../../euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import MessageDetailScreen from "../screens/MessageDetailScreen";
import { MessageRouterScreen } from "../screens/MessageRouterScreen";
import { PnStackNavigator } from "../../pn/navigation/navigator";
import PN_ROUTES from "../../pn/navigation/routes";
import { useIOSelector } from "../../../store/hooks";
import { isGestureEnabled } from "../../../utils/navigation";
import { isPnEnabledSelector } from "../../../store/reducers/backendStatus";
import { LegacyMessageDetailAttachment } from "../screens/LegacyMessageAttachment";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { MessageAttachment } from "../screens/MessageAttachment";
import { MessagesParamsList } from "./params";
import { MESSAGES_ROUTES } from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

export const MessagesStackNavigator = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={MESSAGES_ROUTES.MESSAGE_ROUTER}
      headerMode={"screen"}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        name={MESSAGES_ROUTES.MESSAGE_ROUTER}
        component={MessageRouterScreen}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name={MESSAGES_ROUTES.MESSAGE_DETAIL}
        component={MessageDetailScreen}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name={MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT}
        component={
          isDesignSystemEnabled
            ? MessageAttachment
            : LegacyMessageDetailAttachment
        }
        options={{
          headerShown: isDesignSystemEnabled
        }}
      />

      <Stack.Screen
        name={EUCOVIDCERT_ROUTES.MAIN}
        component={EUCovidCertStackNavigator}
        options={{
          headerShown: false
        }}
      />

      {isPnEnabled && (
        <Stack.Screen
          name={PN_ROUTES.MAIN}
          component={PnStackNavigator}
          options={{
            headerShown: false
          }}
        />
      )}
    </Stack.Navigator>
  );
};

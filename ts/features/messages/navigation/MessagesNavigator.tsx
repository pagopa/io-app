import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isPnEnabledSelector } from "../../../store/reducers/backendStatus";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { isGestureEnabled } from "../../../utils/navigation";
import { EUCovidCertStackNavigator } from "../../euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import { PnStackNavigator } from "../../pn/navigation/navigator";
import PN_ROUTES from "../../pn/navigation/routes";
import { LegacyMessageDetailAttachment } from "../screens/LegacyMessageAttachment";
import LegacyMessageDetailScreen from "../screens/LegacyMessageDetailScreen";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageCalendarScreen } from "../screens/MessageCalendarScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { MessageRouterScreen } from "../screens/MessageRouterScreen";
import { MessagesParamsList } from "./params";
import { MESSAGES_ROUTES } from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

export const MessagesStackNavigator = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPnEnabled = useIOSelector(isPnEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={MESSAGES_ROUTES.MESSAGE_ROUTER}
      screenOptions={{
        gestureEnabled: isGestureEnabled,
        headerMode: "screen",
        headerShown: isDesignSystemEnabled
      }}
    >
      <Stack.Group>
        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_ROUTER}
          component={MessageRouterScreen}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_DETAIL}
          component={
            isDesignSystemEnabled
              ? MessageDetailsScreen
              : LegacyMessageDetailScreen
          }
        />

        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT}
          component={
            isDesignSystemEnabled
              ? MessageAttachmentScreen
              : LegacyMessageDetailAttachment
          }
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
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_CALENDAR}
          component={MessageCalendarScreen}
          options={{
            headerShown: false
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

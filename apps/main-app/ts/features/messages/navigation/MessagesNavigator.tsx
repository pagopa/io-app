import { createStackNavigator } from "@react-navigation/stack";

import { useIOSelector } from "../../../store/hooks";
import { isPnRemoteEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { PnStackNavigator } from "../../pn/navigation/navigator";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageCalendarScreen } from "../screens/MessageCalendarScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { MessageGreenPassScreen } from "../screens/MessageGreenPassScreen";
import { MessageRouterScreen } from "../screens/MessageRouterScreen";
import { MessagesParamsList } from "./params";
import { MESSAGES_ROUTES } from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

export const MessagesStackNavigator = () => {
  const isPnEnabled = useIOSelector(isPnRemoteEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={MESSAGES_ROUTES.MESSAGE_ROUTER}
      screenOptions={{
        gestureEnabled: false,
        headerMode: "screen"
      }}
    >
      <Stack.Group>
        <Stack.Screen
          component={MessageRouterScreen}
          name={MESSAGES_ROUTES.MESSAGE_ROUTER}
        />

        <Stack.Screen
          component={MessageDetailsScreen}
          name={MESSAGES_ROUTES.MESSAGE_DETAIL}
        />

        <Stack.Screen
          component={MessageAttachmentScreen}
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT}
        />

        <Stack.Screen
          component={MessageGreenPassScreen}
          name={MESSAGES_ROUTES.MESSAGE_GREEN_PASS}
          options={{
            animationEnabled: false
          }}
        />

        {isPnEnabled && (
          <Stack.Screen
            component={PnStackNavigator}
            name={PN_ROUTES.MAIN}
            options={{
              gestureEnabled: false,
              headerShown: false
            }}
          />
        )}
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen
          component={MessageCalendarScreen}
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_CALENDAR}
          options={{
            gestureEnabled: false,
            headerShown: false
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

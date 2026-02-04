import { createStackNavigator } from "@react-navigation/stack";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { MessageCalendarScreen } from "../screens/MessageCalendarScreen";
import { MessageRouterScreen } from "../screens/MessageRouterScreen";
import { PnStackNavigator } from "../../pn/navigation/navigator";
import PN_ROUTES from "../../pn/navigation/routes";
import { useIOSelector } from "../../../store/hooks";
import { isPnRemoteEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageGreenPassScreen } from "../screens/MessageGreenPassScreen";
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
          name={MESSAGES_ROUTES.MESSAGE_ROUTER}
          component={MessageRouterScreen}
        />

        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_DETAIL}
          component={MessageDetailsScreen}
        />

        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT}
          component={MessageAttachmentScreen}
        />

        <Stack.Screen
          name={MESSAGES_ROUTES.MESSAGE_GREEN_PASS}
          component={MessageGreenPassScreen}
          options={{
            animation: "none"
          }}
        />

        {isPnEnabled && (
          <Stack.Screen
            name={PN_ROUTES.MAIN}
            component={PnStackNavigator}
            options={{
              gestureEnabled: false,
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
            gestureEnabled: false,
            headerShown: false
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

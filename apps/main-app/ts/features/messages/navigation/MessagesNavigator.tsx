import { createStackNavigator } from "@react-navigation/stack";

import { useIOSelector } from "../../../store/hooks";
import { isPnRemoteEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { PnStackNavigator } from "../../pn/navigation/navigator";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageRouterHeader } from "../components/MessageRouter/MessageRouterHeader";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageCalendarScreen } from "../screens/MessageCalendarScreen";
import { MessageRouterScreen } from "../screens/MessageRouterScreen";
import { MessagesParamsList } from "./params";
import { MESSAGES_ROUTES } from "./routes";

const Stack = createStackNavigator<MessagesParamsList>();

// message router defines a default header to avoid UI jump during screen changes
const messageRouterOptions = {
  header: () => <MessageRouterHeader />
};

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
          options={messageRouterOptions}
        />

        <Stack.Screen
          component={MessageAttachmentScreen}
          name={MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT}
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

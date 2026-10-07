import { createStackNavigator } from "@react-navigation/stack";

import PN_ROUTES from "../../pn/navigation/routes";
import { MessageDetailsScreen as SendMessageDetailsScreen } from "../../pn/screens/MessageDetailsScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { MessageGreenPassScreen } from "../screens/MessageGreenPassScreen";
import { SuccessGetMessageDataActionType } from "../store/actions";
import { MessageContentParamsList } from "./params";
import { MESSAGES_ROUTES } from "./routes";

const Stack = createStackNavigator<MessageContentParamsList>();

const contentRouteName = (message: SuccessGetMessageDataActionType) => {
  if (message.isLegacyGreenPass) {
    return MESSAGES_ROUTES.MESSAGE_GREEN_PASS;
  }
  if (message.isPNMessage) {
    return PN_ROUTES.MESSAGE_DETAILS;
  }
  return MESSAGES_ROUTES.MESSAGE_DETAIL;
};

type MessageContentNavigatorProps = {
  fromPushNotification: boolean;
  message: SuccessGetMessageDataActionType;
};

/**
 * Show a loaded message with the screen of its kind. Each kind is a route of
 * its own, since analytics, contextual help, status messages and support
 * requests are bound to its name. There are no transitions, so that replacing
 * the loading placeholder looks like a change of content in the same screen.
 */
export const MessageContentNavigator = ({
  fromPushNotification,
  message
}: MessageContentNavigatorProps) => (
  <Stack.Navigator
    initialRouteName={contentRouteName(message)}
    screenOptions={{
      animationEnabled: false,
      headerMode: "screen"
    }}
  >
    <Stack.Screen
      component={MessageDetailsScreen}
      initialParams={{
        fromPushNotification,
        messageId: message.messageId,
        serviceId: message.serviceId
      }}
      name={MESSAGES_ROUTES.MESSAGE_DETAIL}
    />
    <Stack.Screen
      component={MessageGreenPassScreen}
      initialParams={{
        fromPushNotification,
        messageId: message.messageId
      }}
      name={MESSAGES_ROUTES.MESSAGE_GREEN_PASS}
    />
    <Stack.Screen
      component={SendMessageDetailsScreen}
      initialParams={{
        firstTimeOpening: message.firstTimeOpening,
        fromPushNotification,
        messageId: message.messageId,
        sendOpeningSource: "message",
        sendUserType: "not_set",
        serviceId: message.serviceId
      }}
      name={PN_ROUTES.MESSAGE_DETAILS}
    />
  </Stack.Navigator>
);

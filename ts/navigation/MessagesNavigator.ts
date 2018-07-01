import { NavigationRouteConfigMap, StackNavigator } from "react-navigation";
import { MessageDetailsScreen } from "../screens/messages/MessageDetailsScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";
import { SafeNavigationScreenComponent } from "../types/redux_navigation";

import ROUTES from "./routes";

const messagesNavigatorConfig: NavigationRouteConfigMap = {
  [ROUTES.MESSAGES_LIST]: {
    screen: MessagesScreen as SafeNavigationScreenComponent<
      typeof MessagesScreen
    >
  },
  [ROUTES.MESSAGE_DETAILS]: {
    screen: MessageDetailsScreen
  }
};

const MessagesNavigator = StackNavigator(messagesNavigatorConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none"
});

export default MessagesNavigator;

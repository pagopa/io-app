import {
  NavigationComponent,
  NavigationRouteConfigMap,
  StackNavigator,
  NavigationScreenComponent
} from "react-navigation";
import { MessageDetailsScreen } from "../screens/messages/MessageDetailsScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";

import ROUTES from "./routes";

// const messagesNavigatorConfig: NavigationRouteConfigMap = {
//   [ROUTES.MESSAGES_LIST]: {
//     screen: MessagesScreen
//   },
//   [ROUTES.MESSAGE_DETAILS]: {
//     screen: MessageDetailsScreen
//   }
// };

const messagesNavigatorConfig: NavigationRouteConfigMap = {
  [ROUTES.MESSAGES_LIST]: {
    screen: MessagesScreen
  }
};

const MessagesNavigator = StackNavigator(messagesNavigatorConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none"
});

export default MessagesNavigator;

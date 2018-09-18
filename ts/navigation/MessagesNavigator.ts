import { createStackNavigator } from "react-navigation";

import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageListScreen from "../screens/messages/MessageListScreen";
import ROUTES from "./routes";

const MessagesNavigator = createStackNavigator(
  {
    [ROUTES.MESSAGE_LIST]: {
      screen: MessageListScreen
    },
    [ROUTES.MESSAGE_DETAIL]: {
      screen: MessageDetailScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default MessagesNavigator;

import { createStackNavigator } from "react-navigation";

import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import ROUTES from "./routes";
import EmailForwardingScreen from '../screens/profile/EmailForwardingScreen';

const MessagesNavigator = createStackNavigator(
  {
    [ROUTES.MESSAGES_HOME]: {
      screen:EmailForwardingScreen
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

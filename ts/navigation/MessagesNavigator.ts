import { createStackNavigator } from "react-navigation";

import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import EmailScreen from "../screens/onboarding/EmailScreen";
import EmailDetailsScreen from "../screens/profile/EmailDetailsScreen";
import ROUTES from "./routes";

const MessagesNavigator = createStackNavigator(
  {
    [ROUTES.MESSAGES_HOME]: {
      screen: EmailScreen
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

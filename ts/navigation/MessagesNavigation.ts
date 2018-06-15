import { StackNavigator } from "react-navigation";
import { MessageDetailsScreen } from "../screens/messages/MessageDetailsScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";

import ROUTES from "./routes";

const Messagesnavigation = StackNavigator(
  {
    [ROUTES.MAIN_MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.MESSAGE_DETAILS]: {
      screen: MessageDetailsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default Messagesnavigation;

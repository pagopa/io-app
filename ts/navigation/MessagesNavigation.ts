import { StackNavigator } from "react-navigation";
import MessagesScreen from "../screens/main/MessagesScreen";
import { MessageDetailsScreen } from "../screens/main/MessageDetailsScreen";

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

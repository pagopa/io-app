import { TabNavigator } from "react-navigation";

import MessagesScreen from "../screens/main/MessagesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import ROUTES from "./routes";

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = TabNavigator(
  {
    [ROUTES.MAIN_MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.MAIN_PROFILE]: {
      screen: ProfileScreen
    }
  },
  {
    initialRouteName: ROUTES.MAIN_MESSAGES,
    tabBarPosition: "bottom"
  }
);

export default navigation;

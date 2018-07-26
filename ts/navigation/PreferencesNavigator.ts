import { createStackNavigator } from "react-navigation";

import MessageDetailsScreen from "../screens/messages/MessageDetailsScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";
import ROUTES from "./routes";

const PreferencesNavigator = createStackNavigator(
  {
    [ROUTES.PREFERENCES_HOME]: {
      screen: PreferencesScreen
    },
    [ROUTES.PREFERENCES_SERVICES]: {
      screen: ServicesScreen
    },
    [ROUTES.PREFERENCES_SERVICE_DETAIL]: {
      screen: ServiceDetailScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default PreferencesNavigator;

import { createStackNavigator } from "react-navigation";

import OldServiceDetailsScreen from "../screens/preferences/OldServiceDetailsScreen";
import OldServicesHomeScreen from "../screens/preferences/OldServicesHomeScreen";
import ROUTES from "./routes";

const OldServicesNavigator = createStackNavigator(
  {
    [ROUTES.SERVICES_HOME]: {
      screen: OldServicesHomeScreen
    },
    [ROUTES.SERVICE_DETAIL]: {
      screen: OldServiceDetailsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default OldServicesNavigator;

import { createStackNavigator } from "react-navigation";

import OldServiceDetailsScreen from "../screens/preferences/OldServiceDetailsScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import ROUTES from "./routes";

const ServicesNavigator = createStackNavigator(
  {
    [ROUTES.SERVICES_HOME]: {
      screen: ServicesHomeScreen
    },
    // TODO Replace when the new detail screen is available
    [ROUTES.SERVICE_DETAIL]: {
      screen: OldServiceDetailsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ServicesNavigator;

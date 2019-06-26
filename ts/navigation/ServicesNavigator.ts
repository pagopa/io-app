import { createStackNavigator } from "react-navigation";

import ServiceDetailsScreen from "../screens/preferences/ServiceDetailsScreen";
import ServicesScreen from "../screens/preferences/ServicesScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import ROUTES from "./routes";

const ServicesNavigator = createStackNavigator(
  {
    // Old version of list services
    [ROUTES.SERVICES_LIST]: {
      screen: ServicesScreen
    },
    // New home
    [ROUTES.SERVICES_HOME]: {
      screen: ServicesHomeScreen
    },
    [ROUTES.SERVICE_DETAIL]: {
      screen: ServiceDetailsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ServicesNavigator;

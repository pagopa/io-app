import { createStackNavigator } from "react-navigation";

import ServiceDetailsScreen from "../screens/preferences/ServiceDetailsScreen";
import ServicesHomeScreen from "../screens/preferences/ServicesHomeScreen";
import ROUTES from "./routes";

const ServicesNavigator = createStackNavigator(
  {
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
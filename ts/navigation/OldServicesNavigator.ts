import { createStackNavigator } from "react-navigation";

import ServiceDetailsScreen from "../screens/preferences/ServiceDetailsScreen";
import ServicesScreen from "../screens/preferences/ServicesScreen";
import ROUTES from "./routes";

const OldServicesNavigator = createStackNavigator(
  {
    [ROUTES.SERVICES_LIST]: {
      screen: ServicesScreen
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

export default OldServicesNavigator;

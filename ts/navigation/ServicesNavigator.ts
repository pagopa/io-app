import { createStackNavigator } from "react-navigation";
import { myPortalEnabled } from "../config";

import ServiceDetailsScreen from "../screens/services/ServiceDetailsScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import ServicesWebviewScreen from "../screens/services/ServicesWebviewScreen";
import ROUTES from "./routes";

const servicesRoutes = {
  [ROUTES.SERVICES_HOME]: {
    screen: ServicesHomeScreen
  },
  [ROUTES.SERVICE_DETAIL]: {
    screen: ServiceDetailsScreen
  }
};

const myPortalRoutes = {
  [ROUTES.SERVICE_WEBVIEW]: {
    screen: ServicesWebviewScreen
  }
};

const ServicesNavigator = createStackNavigator(
  myPortalEnabled ? { ...servicesRoutes, ...myPortalRoutes } : servicesRoutes,
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default ServicesNavigator;

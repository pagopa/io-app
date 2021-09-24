import { createStackNavigator } from "react-navigation-stack";
import { myPortalEnabled, svEnabled } from "../config";

import ServiceDetailsScreen from "../screens/services/ServiceDetailsScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import ServicesWebviewScreen from "../screens/services/ServicesWebviewScreen";
import SvNavigator from "../features/bonus/siciliaVola/navigation/navigator";
import ROUTES from "./routes";

const servicesRoutes = {
  [ROUTES.SERVICES_HOME]: {
    screen: ServicesHomeScreen
  },
  [ROUTES.SERVICE_DETAIL]: {
    screen: ServiceDetailsScreen
  }
};

const myPortalRoutes = myPortalEnabled
  ? {
      [ROUTES.SERVICE_WEBVIEW]: {
        screen: ServicesWebviewScreen
      }
    }
  : {};

const svConfigMap = svEnabled ? SvNavigator : {};

const routeConfig = { ...servicesRoutes, ...myPortalRoutes, ...svConfigMap };

const ServicesNavigator = createStackNavigator(routeConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none",
  defaultNavigationOptions: {
    gesturesEnabled: false
  }
});

export default ServicesNavigator;

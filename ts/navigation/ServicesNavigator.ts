import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import { myPortalEnabled, svEnabled } from "../config";
import SvNavigator from "../features/bonus/siciliaVola/navigation/navigator";

import ServiceDetailsScreen from "../screens/services/ServiceDetailsScreen";
import ServicesWebviewScreen from "../screens/services/ServicesWebviewScreen";
import ROUTES from "./routes";

const servicesRoutes = {
  [ROUTES.SERVICE_DETAIL]: {
    screen: ServiceDetailsScreen
  }
};

const myPortalRoutes = {
  [ROUTES.SERVICE_WEBVIEW]: {
    screen: ServicesWebviewScreen
  }
};

const svConfigMap = svEnabled ? SvNavigator : {};

const routeConfig = myPortalEnabled
  ? { ...servicesRoutes, ...myPortalRoutes, ...svConfigMap }
  : { ...servicesRoutes, ...svConfigMap };

const ServicesNavigator = createCompatNavigatorFactory(createStackNavigator)(
  routeConfig,
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default ServicesNavigator;

import { NavigationRoute, NavigationRouteConfigMap } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import {
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack/src/types";

import { euCovidCertificateEnabled, usePaginatedMessages } from "../config";
import EuCovidCertNavigator from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import PaginatedMessagesHomeScreen from "../screens/messages/PaginatedMessagesHomeScreen";

import ROUTES from "./routes";

const baseMessageRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  [ROUTES.MESSAGES_HOME]: {
    screen: usePaginatedMessages
      ? PaginatedMessagesHomeScreen
      : MessagesHomeScreen
  },
  [ROUTES.MESSAGE_ROUTER]: {
    screen: MessageRouterScreen
  },
  [ROUTES.MESSAGE_DETAIL]: {
    screen: MessageDetailScreen
  }
};

const euCovidCertificateRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = euCovidCertificateEnabled
  ? {
      [EUCOVIDCERT_ROUTES.MAIN]: {
        screen: EuCovidCertNavigator
      }
    }
  : {};

const messageRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  ...baseMessageRouteConfig,
  ...euCovidCertificateRouteConfig
};

const MessagesNavigator = createStackNavigator(messageRouteConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none",
  defaultNavigationOptions: {
    gesturesEnabled: false
  }
});

export default MessagesNavigator;

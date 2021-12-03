import { NavigationRoute, NavigationRouteConfigMap } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import {
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack/src/types";

import {
  euCovidCertificateEnabled,
  mvlEnabled,
  usePaginatedMessages
} from "../config";
import EuCovidCertNavigator from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import MvlNavigator from "../features/mvl/navigatioon/navigator";
import MVL_ROUTES from "../features/mvl/navigatioon/routes";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import PaginatedMessageDetailScreen from "../screens/messages/paginated/MessageDetailScreen";
import PaginatedMessagesHomeScreen from "../screens/messages/paginated/MessagesHomeScreen";

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
    screen: usePaginatedMessages
      ? PaginatedMessageDetailScreen
      : MessageDetailScreen
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

const mvlRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = mvlEnabled
  ? {
      [MVL_ROUTES.MAIN]: {
        screen: MvlNavigator
      }
    }
  : {};

const messageRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  ...baseMessageRouteConfig,
  ...euCovidCertificateRouteConfig,
  ...mvlRouteConfig
};

const MessagesNavigator = createStackNavigator(messageRouteConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none",
  defaultNavigationOptions: {
    gesturesEnabled: false
  }
});

export default MessagesNavigator;

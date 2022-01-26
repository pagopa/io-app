import { NavigationRoute, NavigationRouteConfigMap } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import {
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack/src/types";

import { usePaginatedMessages } from "../config";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import PaginatedMessageRouterScreen from "../screens/messages/paginated/MessageRouterScreen";
import PaginatedMessageDetailScreen from "../screens/messages/paginated/MessageDetailScreen";
import PaginatedMessagesHomeScreen from "../screens/messages/paginated/MessagesHomeScreen";

import ROUTES from "./routes";
import { featuresNavigators } from "../features/common/navigation/navigator";

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
    screen: usePaginatedMessages
      ? PaginatedMessageRouterScreen
      : MessageRouterScreen
  },
  [ROUTES.MESSAGE_DETAIL]: {
    screen: usePaginatedMessages
      ? PaginatedMessageDetailScreen
      : MessageDetailScreen
  }
};

const messageRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  ...baseMessageRouteConfig,
  ...featuresNavigators
};

const MessagesNavigator = createStackNavigator(messageRouteConfig, {
  // Let each screen handle the header and navigation
  headerMode: "none",
  defaultNavigationOptions: {
    gesturesEnabled: false
  }
});

export default MessagesNavigator;

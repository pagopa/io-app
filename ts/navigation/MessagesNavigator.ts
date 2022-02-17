import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import {
  euCovidCertificateEnabled,
  mvlEnabled,
  usePaginatedMessages
} from "../config";
import EuCovidCertNavigator from "../features/euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import MvlNavigator from "../features/mvl/navigation/navigator";
import MVL_ROUTES from "../features/mvl/navigation/routes";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import MessageRouterScreen from "../screens/messages/MessageRouterScreen";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import PaginatedMessageDetailScreen from "../screens/messages/paginated/MessageDetailScreen";
import PaginatedMessageRouterScreen from "../screens/messages/paginated/MessageRouterScreen";
import PaginatedMessagesHomeScreen from "../screens/messages/paginated/MessagesHomeScreen";

import ROUTES from "./routes";

const baseMessageRouteConfig = {
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
  },
  [ROUTES.MESSAGE_ROUTER_PAGINATED]: {
    screen: PaginatedMessageRouterScreen
  },
  [ROUTES.MESSAGE_DETAIL_PAGINATED]: {
    screen: PaginatedMessageDetailScreen
  }
};

const euCovidCertificateRouteConfig = {
  [EUCOVIDCERT_ROUTES.MAIN]: {
    screen: EuCovidCertNavigator
  }
};

const mvlRouteConfig = {
  [MVL_ROUTES.MAIN]: {
    screen: MvlNavigator
  }
};
const messageRouteConfig = {
  ...baseMessageRouteConfig,
  ...(euCovidCertificateEnabled ? euCovidCertificateRouteConfig : {}),
  ...(mvlEnabled ? mvlRouteConfig : {})
};

const MessagesNavigator = createCompatNavigatorFactory(createStackNavigator)(
  messageRouteConfig,
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default MessagesNavigator;

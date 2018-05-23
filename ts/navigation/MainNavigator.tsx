/**
 * Main navigator, handling the navigation within
 * the app *after* the login has occurred. This takes
 * care of displaying a tab navigator with the
 * appropriate icons
 */

import * as React from "react";
import ROUTES from "./routes";

import { Icon } from "native-base";
import { TabBarBottom, TabNavigator } from "react-navigation";
import MessagesScreen from "../screens/main/MessagesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import WalletNavigator from "./WalletNavigator";

// routes that should be paired with an icon
type RoutesWithIcons =
  | "MAIN_MESSAGES"
  | "WALLET_HOME"
  | "DOCUMENTS_HOME"
  | "PREFERENCES_HOME"
  | "MAIN_PROFILE";
type RouteIconMap = { [key in RoutesWithIcons]: string };

const ROUTE_ICON: RouteIconMap = {
  MAIN_MESSAGES: "mail",
  WALLET_HOME: "wallet",
  DOCUMENTS_HOME: "document",
  PREFERENCES_HOME: "cog",
  MAIN_PROFILE: "user"
};

const getIcon = (routeName: RoutesWithIcons): string => {
  return ROUTE_ICON[routeName];
};

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = TabNavigator(
  {
    [ROUTES.MAIN_MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.WALLET_HOME]: {
      screen: WalletNavigator
    },
    [ROUTES.DOCUMENTS_HOME]: {
      screen: WalletNavigator
    },
    [ROUTES.PREFERENCES_HOME]: {
      screen: WalletNavigator
    },
    [ROUTES.MAIN_PROFILE]: {
      screen: ProfileScreen
    }
  },
  {
    navigationOptions: ({ navigation: nav }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = nav.state;
        const iconName: string = getIcon(routeName as RoutesWithIcons);
        return <Icon name={iconName} active={focused} />;
      }
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: "bottom",
    tabBarOptions: {
      activeTintColor: "black",
      inactiveTintColor: "gray"
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MAIN_MESSAGES
  }
);

export default navigation;

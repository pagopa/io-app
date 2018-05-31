/**
 * Main navigator, handling the navigation within
 * the app *after* the login has occurred. This takes
 * care of displaying a tab navigator with the
 * appropriate icons
 */

import * as React from "react";
import ROUTES from "./routes";

import { TabBarBottom, TabNavigator } from "react-navigation";
import I18n from "../i18n";
import MessagesScreen from "../screens/main/MessagesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import Icon from "../theme/font-icons/io-icon-font";
import variables from "../theme/variables";
import WalletNavigator from "./WalletNavigator";

type Routes = keyof typeof ROUTES;

type RouteLabelMap = { [key in Routes]?: string };
const ROUTE_LABEL: RouteLabelMap = {
  MAIN_MESSAGES: I18n.t("global.navigator.messages"),
  WALLET_HOME: I18n.t("global.navigator.wallet"),
  DOCUMENTS_HOME: I18n.t("global.navigator.documents"),
  PREFERENCES_HOME: I18n.t("global.navigator.preferences"),
  MAIN_PROFILE: I18n.t("global.navigator.profile")
};

type RouteIconMap = { [key in Routes]?: string };
const ROUTE_ICON: RouteIconMap = {
  MAIN_MESSAGES: "io-messaggi",
  WALLET_HOME: "io-portafoglio",
  DOCUMENTS_HOME: "io-documenti",
  PREFERENCES_HOME: "io-preferenze",
  MAIN_PROFILE: "io-profilo"
};

const getLabel = (routeName: string): string => {
  const fallbackLabel = "unknown"; // fallback label
  const label = ROUTE_LABEL[routeName as Routes]; // routeName is defined as string, but has values within Routes
  return label === undefined ? fallbackLabel : label;
};

const getIcon = (routeName: string): string => {
  const fallbackIcon = "io-question"; // fallback icon: question mark
  const route = ROUTE_ICON[routeName as Routes];
  return route === undefined ? fallbackIcon : route;
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
      tabBarLabel: _ => {
        const { routeName } = nav.state;
        return getLabel(routeName);
      },
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = nav.state;
        const iconName: string = getIcon(routeName);
        return (
          <Icon
            name={iconName}
            size={variables.iconSize4}
            color={tintColor === null ? undefined : tintColor}
          />
        );
      }
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: "bottom",
    tabBarOptions: {
      activeTintColor: variables.brandPrimary,
      inactiveTintColor: variables.brandDarkGray
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MAIN_MESSAGES
  }
);

export default navigation;

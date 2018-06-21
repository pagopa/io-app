/**
 * Main navigator, handling the navigation within
 * the app *after* the login has occurred. This takes
 * care of displaying a tab navigator with the
 * appropriate icons
 */

import * as React from "react";
import ROUTES from "./routes";

import { Platform, StyleSheet, Text } from "react-native";
import { TabBarBottom, TabNavigator } from "react-navigation";
import I18n from "../i18n";
import MessagesScreen from "../screens/main/MessagesScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import Icon from "../theme/font-icons/io-icon-font";
import { makeFontStyleObject } from "../theme/fonts";
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
  // "routeName as Routes" is assumed to be safe as explained @https://github.com/teamdigitale/italia-app/pull/193#discussion_r192347234
  // adding fallback anyway -- better safe than sorry
  const label = ROUTE_LABEL[routeName as Routes];
  return label === undefined ? fallbackLabel : label;
};

const getIcon = (routeName: string): string => {
  const fallbackIcon = "io-question"; // fallback icon: question mark
  const route = ROUTE_ICON[routeName as Routes]; // same as for getLabel
  return route === undefined ? fallbackIcon : route;
};

const styles = StyleSheet.create({
  labelStyle: {
    ...makeFontStyleObject(Platform.select),
    textAlign: "center",
    fontSize: variables.fontSize1
  },
  tabBarStyle: {
    height: 64,
    backgroundColor: variables.colorWhite,
    paddingLeft: 3,
    paddingRight: 3,
    borderTopWidth: 0,
    paddingTop: 12,
    paddingBottom: 7
  }
});

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
      tabBarLabel: ({ tintColor }) => {
        const { routeName } = nav.state;
        // adding `color` as a separate style property since it depends on tintColor
        return (
          <Text
            style={[
              styles.labelStyle,
              { color: tintColor === null ? undefined : tintColor }
            ]}
          >
            {getLabel(routeName)}
          </Text>
        );
      },
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = nav.state;
        const iconName: string = getIcon(routeName);
        return (
          <Icon
            name={iconName}
            size={variables.iconSize3}
            color={tintColor === null ? undefined : tintColor}
          />
        );
      }
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: "bottom",
    tabBarOptions: {
      activeTintColor: variables.brandPrimary,
      inactiveTintColor: variables.brandDarkGray,
      style: styles.tabBarStyle
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MAIN_MESSAGES
  }
);

export default navigation;

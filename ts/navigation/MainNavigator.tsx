/**
 * Main navigator, handling the navigation within
 * the app *after* the login has occurred. This takes
 * care of displaying a tab navigator with the
 * appropriate icons
 */

import * as React from "react";
import ROUTES from "./routes";

import { Platform, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "react-navigation";
import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import ProfileScreen from "../screens/main/ProfileScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";
import MessageNavigator from "./MessagesNavigator";
import WalletNavigator from "./WalletNavigator";

type Routes = keyof typeof ROUTES;

type RouteLabelMap = { [key in Routes]?: string };
const ROUTE_LABEL: RouteLabelMap = {
  MESSAGES_HOME: I18n.t("global.navigator.messages"),
  WALLET_HOME: I18n.t("global.navigator.wallet"),
  DOCUMENTS_HOME: I18n.t("global.navigator.documents"),
  PREFERENCES_HOME: I18n.t("global.navigator.preferences"),
  MAIN_PROFILE: I18n.t("global.navigator.profile")
};

type RouteIconMap = { [key in Routes]?: string };
const ROUTE_ICON: RouteIconMap = {
  MESSAGES_HOME: "io-messaggi",
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
const navigation = createBottomTabNavigator(
  {
    [ROUTES.MESSAGES_HOME]: {
      screen: MessageNavigator
    },
    [ROUTES.WALLET_HOME]: {
      screen: WalletNavigator
    },
    [ROUTES.DOCUMENTS_HOME]: {
      screen: PlaceholderScreen
    },
    [ROUTES.PREFERENCES_HOME]: {
      screen: PreferencesScreen
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
          <IconFont
            name={iconName}
            size={variables.iconSize3}
            color={tintColor === null ? undefined : tintColor}
          />
        );
      }
    }),
    tabBarOptions: {
      activeTintColor: variables.brandPrimary,
      inactiveTintColor: variables.brandDarkGray,
      style: styles.tabBarStyle
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MESSAGES_HOME
  }
);

export default navigation;

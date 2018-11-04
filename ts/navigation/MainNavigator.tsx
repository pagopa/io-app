/**
 * Main navigator, handling the navigation within
 * the app *after* the login has occurred. This takes
 * care of displaying a tab navigator with the
 * appropriate icons
 */

import * as React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import {
  createBottomTabNavigator,
  NavigationRoute,
  NavigationScreenProp,
  NavigationState,
  StackActions
} from "react-navigation";

import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";
import MessageNavigator from "./MessagesNavigator";
import PreferencesNavigator from "./PreferencesNavigator";
import ProfileNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import WalletNavigator from "./WalletNavigator";

type Routes = keyof typeof ROUTES;

type RouteLabelMap = { [key in Routes]?: string };
const ROUTE_LABEL: RouteLabelMap = {
  MESSAGES_NAVIGATOR: I18n.t("global.navigator.messages"),
  WALLET_HOME: I18n.t("global.navigator.wallet"),
  DOCUMENTS_HOME: I18n.t("global.navigator.documents"),
  PREFERENCES_HOME: I18n.t("global.navigator.preferences"),
  PROFILE_NAVIGATOR: I18n.t("global.navigator.profile")
};

type RouteIconMap = { [key in Routes]?: string };
const ROUTE_ICON: RouteIconMap = {
  MESSAGES_NAVIGATOR: "io-messaggi",
  WALLET_HOME: "io-portafoglio",
  DOCUMENTS_HOME: "io-documenti",
  PREFERENCES_HOME: "io-preferenze",
  PROFILE_NAVIGATOR: "io-profilo"
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
    paddingTop: 8,
    paddingBottom: 10
  },
  upsideShadow: {
    // iOS shadow
    shadowColor: variables.footerShadowColor,
    shadowOffset: {
      width: variables.footerShadowOffsetWidth,
      height: variables.footerShadowOffsetHeight
    },
    zIndex: 999,
    shadowOpacity: variables.footerShadowOpacity,
    shadowRadius: variables.footerShadowRadius,
    // Android shadow
    elevation: variables.footerElevation
  }
});

const NoTabBarRoutes: ReadonlyArray<string> = [
  ROUTES.WALLET_ADD_PAYMENT_METHOD,
  ROUTES.PAYMENT_SCAN_QR_CODE,
  ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
  ROUTES.WALLET_ADD_CARD,
  ROUTES.WALLET_CONFIRM_CARD_DETAILS,
  ROUTES.PAYMENT_TRANSACTION_SUMMARY,
  ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
  ROUTES.PAYMENT_PICK_PSP,
  ROUTES.PAYMENT_PICK_PAYMENT_METHOD
];

const getTabBarVisibility = (
  nav: NavigationScreenProp<NavigationRoute>
): boolean => {
  const state = nav.state as NavigationState;

  const { routeName } = state.routes[state.index];

  if (NoTabBarRoutes.indexOf(routeName) !== -1) {
    return false;
  }

  return true;
};

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = createBottomTabNavigator(
  {
    [ROUTES.MESSAGES_NAVIGATOR]: {
      screen: MessageNavigator
    },
    [ROUTES.WALLET_HOME]: {
      screen: WalletNavigator
    },
    // FIXME: Documents are temporarily disabled during the experimental phase
    // see https://www.pivotaltracker.com/story/show/159490857
    // [ROUTES.DOCUMENTS_HOME]: {
    //   screen: PlaceholderScreen
    // },
    [ROUTES.PREFERENCES_HOME]: {
      screen: PreferencesNavigator
    },
    [ROUTES.PROFILE_NAVIGATOR]: {
      screen: ProfileNavigator
    }
  },
  {
    navigationOptions: ({ navigation: nav }) => ({
      tabBarVisible: getTabBarVisibility(nav),
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
      },
      tabBarOnPress: options => {
        if (options.navigation.state.index > 0) {
          // Always show the first screen on tab press
          options.navigation.dispatch(
            StackActions.popToTop({
              immediate: true,
              key: options.navigation.state.key
            })
          );
        } else {
          options.defaultHandler();
        }
      }
    }),
    tabBarOptions: {
      activeTintColor: variables.brandPrimary,
      inactiveTintColor: variables.brandDarkGray,
      style: [styles.tabBarStyle, styles.upsideShadow]
    },
    animationEnabled: true,
    swipeEnabled: false,
    initialRouteName: ROUTES.MESSAGES_NAVIGATOR
  }
);

export default navigation;

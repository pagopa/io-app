/**
 * Main navigator, handling the navigation within
 * the app *after* the login and onboarding have
 * occurred. This takes care of displaying a tab
 * navigator with the appropriate icons
 */

import * as React from "react";
import { StyleSheet } from "react-native";
import {
  createBottomTabNavigator,
  NavigationRoute,
  NavigationScreenProp,
  NavigationState,
  StackActions
} from "react-navigation";
import MessagesTabIcon from "../components/MessagesTabIcon";
import NavBarLabel from "../components/NavBarLabel";
import ProfileTabIcon from "../components/ProfileTabIcon";
import ServiceTabIcon from "../components/ServiceTabIcon";
import IconFont from "../components/ui/IconFont";
import WalletTabIcon from "../components/WalletTabIcon";
import variables from "../theme/variables";
import MessageNavigator from "./MessagesNavigator";
import ProfileNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import ServicesNavigator from "./ServicesNavigator";
import WalletNavigator from "./WalletNavigator";

type Routes = keyof typeof ROUTES;

type RouteIconMap = { [key in Routes]?: string };
const ROUTE_ICON: RouteIconMap = {
  MESSAGES_NAVIGATOR: "io-messaggi",
  WALLET_HOME: "io-portafoglio",
  DOCUMENTS_HOME: "io-documenti",
  SERVICES_NAVIGATOR: "io-servizi",
  PROFILE_NAVIGATOR: "io-profilo"
};

const getIcon = (routeName: string): string => {
  const fallbackIcon = "io-question"; // fallback icon: question mark
  const route = ROUTE_ICON[routeName as Routes]; // same as for getLabel
  return route === undefined ? fallbackIcon : route;
};

const styles = StyleSheet.create({
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
  ROUTES.PAYMENT_PICK_PAYMENT_METHOD,
  ROUTES.PAYMENT_TRANSACTION_ERROR,
  ROUTES.PAYMENT_TRANSACTION_SUCCESS,
  ROUTES.READ_EMAIL_SCREEN,
  ROUTES.INSERT_EMAIL_SCREEN,
  ROUTES.WALLET_TRANSACTION_DETAILS,
  ROUTES.DONATION_DETAIL,
  ROUTES.PAYMENTS_HISTORY_SCREEN,
  ROUTES.PAYMENT_HISTORY_DETAIL_INFO
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
    [ROUTES.SERVICES_NAVIGATOR]: {
      screen: ServicesNavigator
    },
    [ROUTES.PROFILE_NAVIGATOR]: {
      screen: ProfileNavigator
    }
  },
  {
    defaultNavigationOptions: ({ navigation: nav }) => ({
      tabBarVisible: getTabBarVisibility(nav),
      tabBarLabel: (options: {
        tintColor: string | null;
        focused: boolean;
      }) => {
        const { routeName } = nav.state;
        // adding `color` as a separate style property since it depends on tintColor
        return <NavBarLabel options={options} routeName={routeName} />;
      },
      tabBarIcon: (options: { tintColor: string | null; focused: boolean }) => {
        const { routeName } = nav.state;
        const iconName: string = getIcon(routeName);
        if (routeName === ROUTES.MESSAGES_NAVIGATOR) {
          return (
            <MessagesTabIcon
              color={options.tintColor === null ? undefined : options.tintColor}
            />
          );
        }
        if (iconName === ROUTE_ICON.WALLET_HOME) {
          return (
            <WalletTabIcon
              color={options.tintColor === null ? undefined : options.tintColor}
            />
          );
        }
        if (iconName === ROUTE_ICON.PROFILE_NAVIGATOR) {
          return (
            <ProfileTabIcon
              size={variables.iconSize3}
              color={options.tintColor === null ? undefined : options.tintColor}
            />
          );
        }
        if (iconName === ROUTE_ICON.SERVICES_NAVIGATOR) {
          return (
            <ServiceTabIcon
              color={options.tintColor === null ? undefined : options.tintColor}
            />
          );
        } else {
          return (
            <IconFont
              name={iconName}
              size={variables.iconSize3}
              color={options.tintColor === null ? undefined : options.tintColor}
            />
          );
        }
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
      /**
       * Add the hidden on keyboard show option when https://www.pivotaltracker.com/story/show/172715822
       * see https://github.com/react-navigation/react-navigation/issues/7415#issuecomment-485027123
       */
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

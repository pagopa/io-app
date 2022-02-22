/**
 * Main navigator, handling the navigation within
 * the app *after* the login and onboarding have
 * occurred. This takes care of displaying a tab
 * navigator with the appropriate icons
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createCompatNavigatorFactory } from "@react-navigation/compat";
import * as React from "react";
import { StyleSheet } from "react-native";
import deviceInfoModule from "react-native-device-info";
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
  SERVICES_NAVIGATOR: "io-servizi",
  PROFILE_NAVIGATOR: "io-profilo"
};

const getIcon = (routeName: string): string => {
  const fallbackIcon = "io-question"; // fallback icon: question mark
  const route = ROUTE_ICON[routeName as Routes]; // same as for getLabel
  return route === undefined ? fallbackIcon : route;
};

const tabBarStyleFactory = () => {
  const defaultStyle = {
    backgroundColor: variables.colorWhite,
    paddingLeft: 3,
    paddingRight: 3,
    borderTopWidth: 0,
    paddingTop: 8,
    height: 64
  };

  return deviceInfoModule.hasNotch()
    ? defaultStyle
    : { ...defaultStyle, paddingBottom: 10 };
};

const styles = StyleSheet.create({
  tabBarStyle: tabBarStyleFactory(),
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

const TabFirstLevelRoutes: Array<string> = [
  ROUTES.WALLET_HOME,
  ROUTES.MESSAGES_HOME,
  ROUTES.SERVICES_HOME,
  ROUTES.PROFILE_MAIN
];

// const getTabBarVisibility = (
//   nav: NavigationScreenProp<NavigationRoute>
// ): boolean => {
//   const state = nav.state as NavigationState;
//
//   const { routeName } = state.routes[state.index];
//
//   return TabFirstLevelRoutes.indexOf(routeName) !== -1;
// };

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = createCompatNavigatorFactory(createBottomTabNavigator)(
  {
    [ROUTES.MESSAGES_NAVIGATOR]: {
      screen: MessageNavigator
    },
    [ROUTES.WALLET_HOME]: {
      screen: WalletNavigator
    },
    [ROUTES.SERVICES_NAVIGATOR]: {
      screen: ServicesNavigator
    },
    [ROUTES.PROFILE_NAVIGATOR]: {
      screen: ProfileNavigator
    }
  },
  {
    // defaultNavigationOptions: ({ navigation }) => ({
    //   // tabBarVisible: getTabBarVisibility(nav),
    //   tabBarLabel: (options: {
    //     tintColor: string | null;
    //     focused: boolean;
    //   }) => {
    //     const { routeName } = nav.state;
    //     // adding `color` as a separate style property since it depends on tintColor
    //     return <NavBarLabel options={options} routeName={routeName} />;
    //   },
    //   tabBarIcon: (options: { tintColor: string | null; focused: boolean }) => {
    //     const { routeName } = nav.state;
    //     const iconName: string = getIcon(routeName);
    //     if (routeName === ROUTES.MESSAGES_NAVIGATOR) {
    //       return (
    //         <MessagesTabIcon
    //           color={options.tintColor === null ? undefined : options.tintColor}
    //         />
    //       );
    //     }
    //     if (iconName === ROUTE_ICON.WALLET_HOME) {
    //       return (
    //         <WalletTabIcon
    //           color={options.tintColor === null ? undefined : options.tintColor}
    //         />
    //       );
    //     }
    //     if (iconName === ROUTE_ICON.PROFILE_NAVIGATOR) {
    //       return (
    //         <ProfileTabIcon
    //           size={variables.iconSize3}
    //           color={options.tintColor === null ? undefined : options.tintColor}
    //         />
    //       );
    //     }
    //     if (iconName === ROUTE_ICON.SERVICES_NAVIGATOR) {
    //       return (
    //         <ServiceTabIcon
    //           color={options.tintColor === null ? undefined : options.tintColor}
    //         />
    //       );
    //     } else {
    //       return (
    //         <IconFont
    //           name={iconName}
    //           size={variables.iconSize3}
    //           color={options.tintColor === null ? undefined : options.tintColor}
    //         />
    //       );
    //     }
    //   }
    // }),
    tabBarOptions: {
      /**
       * Add the hidden on keyboard show option when https://www.pivotaltracker.com/story/show/172715822
       * see https://github.com/react-navigation/react-navigation/issues/7415#issuecomment-485027123
       */
      activeTintColor: variables.brandPrimary,
      inactiveTintColor: variables.brandDarkGray,
      style: [styles.tabBarStyle, styles.upsideShadow]
    },
    initialRouteName: ROUTES.MESSAGES_NAVIGATOR
  }
);

export default navigation;

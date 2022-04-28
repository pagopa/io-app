import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { StyleSheet } from "react-native";
import deviceInfoModule from "react-native-device-info";
import { makeFontStyleObject } from "../components/core/fonts";
import { IOColors } from "../components/core/variables/IOColors";
import MessagesTabIcon from "../components/MessagesTabIcon";
import ProfileTabIcon from "../components/ProfileTabIcon";
import ServiceTabIcon from "../components/ServiceTabIcon";
import WalletTabIcon from "../components/WalletTabIcon";
import { usePaginatedMessages } from "../config";
import I18n from "../i18n";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import PaginatedMessagesHomeScreen from "../screens/messages/paginated/MessagesHomeScreen";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import variables from "../theme/variables";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const Tab = createBottomTabNavigator<MainTabParamsList>();

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: variables.colorWhite,
    paddingLeft: 3,
    paddingRight: 3,
    borderTopWidth: 0,
    paddingTop: 8,
    height: 64 + (deviceInfoModule.hasNotch() ? 24 : 0),
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
  },
  notchPadding: deviceInfoModule.hasNotch() ? {} : { paddingBottom: 10 }
});

export const MainTabNavigator = () => (
  <Tab.Navigator
    tabBarOptions={{
      labelStyle: {
        fontSize: 14,
        ...makeFontStyleObject("Regular")
      },
      keyboardHidesTabBar: true,
      allowFontScaling: false,
      activeTintColor: IOColors.blue,
      inactiveTintColor: IOColors.bluegrey,
      style: [styles.tabBarStyle, styles.notchPadding]
    }}
  >
    <Tab.Screen
      name={ROUTES.MESSAGES_HOME}
      component={
        usePaginatedMessages ? PaginatedMessagesHomeScreen : MessagesHomeScreen
      }
      options={{
        title: I18n.t("global.navigator.messages"),
        tabBarIcon: ({ color }) => <MessagesTabIcon color={color} />
      }}
    />
    <Tab.Screen
      name={ROUTES.WALLET_HOME}
      component={WalletHomeScreen}
      options={{
        title: I18n.t("global.navigator.wallet"),
        tabBarIcon: ({ color }) => <WalletTabIcon color={color} />
      }}
    />
    <Tab.Screen
      name={ROUTES.SERVICES_HOME}
      component={ServicesHomeScreen}
      options={{
        title: I18n.t("global.navigator.services"),
        tabBarIcon: ({ color }) => <ServiceTabIcon color={color} />
      }}
    />
    <Tab.Screen
      name={ROUTES.PROFILE_MAIN}
      component={ProfileMainScreen}
      options={{
        title: I18n.t("global.navigator.profile"),
        tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />
      }}
    />
  </Tab.Navigator>
);

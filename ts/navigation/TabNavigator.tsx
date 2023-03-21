import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeFontStyleObject } from "../components/core/fonts";
import { IOColors } from "../components/core/variables/IOColors";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import MessagesTabIcon from "../components/MessagesTabIcon";
import ProfileTabIcon from "../components/ProfileTabIcon";
import ServiceTabIcon from "../components/ServiceTabIcon";
import WalletTabIcon from "../components/WalletTabIcon";
import I18n from "../i18n";
import PaginatedMessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import { useIOSelector } from "../store/hooks";
import { isStartupLoaded } from "../store/reducers/startup";
import variables from "../theme/variables";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const Tab = createBottomTabNavigator<MainTabParamsList>();

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: IOColors.white,
    paddingLeft: 3,
    paddingRight: 3,
    borderTopWidth: 0,
    paddingTop: 8,
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

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const startupLoaded = useIOSelector(isStartupLoaded);
  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;

  return (
    <LoadingSpinnerOverlay isLoading={!startupLoaded} loadingOpacity={1}>
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
          style: [
            styles.tabBarStyle,
            { height: tabBarHeight + bottomInset },
            insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
          ]
        }}
      >
        <Tab.Screen
          name={ROUTES.MESSAGES_HOME}
          component={PaginatedMessagesHomeScreen}
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
    </LoadingSpinnerOverlay>
  );
};

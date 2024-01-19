import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOColors } from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "../components/core/fonts";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { TabIconComponent } from "../components/ui/TabIconComponent";
import I18n from "../i18n";
import MessagesHomeScreen from "../features/messages/screens/MessagesHomeScreen";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import { useIOSelector } from "../store/hooks";
import { isDesignSystemEnabledSelector } from "../store/reducers/persistedPreferences";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import variables from "../theme/variables";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { AppParamsList, IOStackNavigationProp } from "./params/AppParamsList";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";
import { HeaderFirstLevelHandler } from "./components/HeaderFirstLevelHandler";

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
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToBarcodeScanScreen = () => {
    navigation.navigate(ROUTES.BARCODE_SCAN);
  };

  return (
    <LoadingSpinnerOverlay
      isLoading={startupLoaded === StartupStatusEnum.ONBOARDING}
      loadingOpacity={1}
    >
      <HeaderFirstLevelHandler />
      <Tab.Navigator
        tabBarOptions={{
          labelStyle: {
            fontSize: isDesignSystemEnabled ? 10 : 12,
            ...makeFontStyleObject(
              "Regular",
              false,
              isDesignSystemEnabled ? "ReadexPro" : "TitilliumWeb"
            )
          },
          keyboardHidesTabBar: true,
          allowFontScaling: false,
          activeTintColor: isDesignSystemEnabled
            ? IOColors["blueIO-500"]
            : IOColors.blue,
          inactiveTintColor: IOColors["grey-850"],
          style: [
            styles.tabBarStyle,
            { height: tabBarHeight + bottomInset },
            insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
          ]
        }}
      >
        <Tab.Screen
          name={MESSAGES_ROUTES.MESSAGES_HOME}
          component={MessagesHomeScreen}
          options={{
            title: I18n.t("global.navigator.messages"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName={"navMessages"}
                iconNameFocused={"navMessagesFocused"}
                color={color}
                focused={focused}
                // Badge is disabled with paginated messages.
                // https://pagopa.atlassian.net/browse/IA-572
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.WALLET_HOME}
          component={WalletHomeScreen}
          options={{
            title: I18n.t("global.navigator.wallet"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName={"navWallet"}
                iconNameFocused={"navWalletFocused"}
                color={color}
                focused={focused}
              />
            )
          }}
        />
        {isDesignSystemEnabled && (
          <Tab.Screen
            name={ROUTES.BARCODE_SCAN}
            component={EmptyComponent}
            listeners={{
              tabPress: ({ preventDefault }) => {
                preventDefault();
                navigateToBarcodeScanScreen();
              }
            }}
            options={{
              title: I18n.t("global.navigator.scan"),
              tabBarIcon: ({ color, focused }) => (
                <TabIconComponent
                  iconName={"navScan"}
                  iconNameFocused={"navScan"}
                  color={color}
                  focused={focused}
                />
              )
            }}
          />
        )}
        <Tab.Screen
          name={ROUTES.SERVICES_HOME}
          component={ServicesHomeScreen}
          options={{
            title: I18n.t("global.navigator.services"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName="navServices"
                iconNameFocused="navServicesFocused"
                color={color}
                focused={focused}
                // Badge counter has been disabled
                // https://www.pivotaltracker.com/story/show/176919053
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.PROFILE_MAIN}
          component={ProfileMainScreen}
          options={{
            title: I18n.t("global.navigator.profile"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName={"navProfile"}
                iconNameFocused={"navProfileFocused"}
                color={color}
                focused={focused}
              />
            )
          }}
        />
      </Tab.Navigator>
    </LoadingSpinnerOverlay>
  );
};

/**
 * Used to mock tab content. This will never be rendered.
 */
const EmptyComponent = () => <></>;

import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { makeFontStyleObject } from "../components/core/fonts";
import { TabIconComponent } from "../components/ui/TabIconComponent";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { MessagesHomeScreen } from "../features/messages/screens/MessagesHomeScreen";
import { WalletHomeScreen as NewWalletHomeScreen } from "../features/newWallet/screens/WalletHomeScreen";
import { PaymentsHomeScreen } from "../features/payments/home/screens/PaymentsHomeScreen";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { ServicesHomeScreen } from "../features/services/home/screens/ServicesHomeScreen";
import { useBottomTabNavigatorStyle } from "../hooks/useBottomTabNavigatorStyle";
import I18n from "../i18n";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import { useIOSelector } from "../store/hooks";
import {
  isNewPaymentSectionEnabledSelector,
  isSettingsVisibleAndHideProfileSelector
} from "../store/reducers/backendStatus/remoteConfig";
import { isDesignSystemEnabledSelector } from "../store/reducers/persistedPreferences";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import { HeaderFirstLevelHandler } from "./components/HeaderFirstLevelHandler";
import { useIONavigation } from "./params/AppParamsList";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const Tab = createBottomTabNavigator<MainTabParamsList>();

export const MainTabNavigator = () => {
  const theme = useIOTheme();
  const navigation = useIONavigation();

  const startupLoaded = useIOSelector(isStartupLoaded);
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isNewWalletSectionEnabled = useIOSelector(
    isNewPaymentSectionEnabledSelector
  );

  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const navigateToBarcodeScanScreen = () => {
    navigation.navigate(ROUTES.BARCODE_SCAN);
  };

  const tabBarStyle = useBottomTabNavigatorStyle();

  return (
    <LoadingSpinnerOverlay
      isLoading={startupLoaded === StartupStatusEnum.ONBOARDING}
      loadingOpacity={1}
    >
      <Tab.Navigator
        screenOptions={{
          header: ({ route }) => (
            <HeaderFirstLevelHandler
              currentRouteName={route.name as keyof MainTabParamsList}
            />
          ),
          tabBarLabelStyle: {
            fontSize: isDesignSystemEnabled ? 10 : 12,
            ...makeFontStyleObject(
              "Regular",
              false,
              isDesignSystemEnabled ? "ReadexPro" : "TitilliumSansPro"
            )
          },
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: false,
          tabBarActiveTintColor: IOColors[theme["interactiveElem-default"]],
          tabBarInactiveTintColor: IOColors[theme["textBody-secondary"]],
          tabBarStyle
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
              />
            )
          }}
        />
        <Tab.Screen
          name={ROUTES.WALLET_HOME}
          component={NewWalletHomeScreen}
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
        {isSettingsVisibleAndHideProfile && (
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
        {isNewWalletSectionEnabled && (
          <Tab.Screen
            name={ROUTES.PAYMENTS_HOME}
            component={PaymentsHomeScreen}
            options={{
              title: I18n.t("global.navigator.payments"),
              tabBarIcon: ({ color, focused }) => (
                <TabIconComponent
                  iconName={"navPsp"}
                  iconNameFocused={"navPsp"}
                  color={color}
                  focused={focused}
                />
              )
            }}
          />
        )}
        <Tab.Screen
          name={SERVICES_ROUTES.SERVICES_HOME}
          component={ServicesHomeScreen}
          options={{
            title: I18n.t("global.navigator.services"),
            tabBarIcon: ({ color, focused }) => (
              <TabIconComponent
                iconName="navServices"
                iconNameFocused="navServicesFocused"
                color={color}
                focused={focused}
              />
            )
          }}
        />
        {!isSettingsVisibleAndHideProfile && (
          <Tab.Screen
            name={ROUTES.PROFILE_MAIN}
            component={ProfileMainScreen}
            options={{
              title: I18n.t("global.navigator.profile"),
              tabBarIcon: ({ color, focused }) => (
                <TabIconComponent
                  iconName="navProfile"
                  iconNameFocused="navProfileFocused"
                  color={color}
                  focused={focused}
                />
              )
            }}
          />
        )}
      </Tab.Navigator>
    </LoadingSpinnerOverlay>
  );
};

/**
 * Used to mock tab content. This will never be rendered.
 */
const EmptyComponent = () => <></>;

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActionProp,
  HeaderFirstLevel,
  IOColors,
  IOIcons
} from "@pagopa/io-app-design-system";
import { ComponentProps, useEffect, useMemo } from "react";
import { makeFontStyleObject } from "../components/core/fonts";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { TabIconComponent } from "../components/ui/TabIconComponent";
import I18n from "../i18n";
import MessagesHomeScreen from "../screens/messages/MessagesHomeScreen";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { isDesignSystemEnabledSelector } from "../store/reducers/persistedPreferences";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import variables from "../theme/variables";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../hooks/useStartSupportRequest";
import { useWalletHomeHeaderBottomSheet } from "../components/wallet/WalletHomeHeader";
import { searchMessagesEnabled } from "../store/actions/search";
import { navigateToServicePreferenceScreen } from "../store/actions/navigation";
import { AppParamsList, IOStackNavigationProp } from "./params/AppParamsList";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

type HeaderFirstLevelProps = ComponentProps<typeof HeaderFirstLevel>;
type TabRoutes = keyof MainTabParamsList;

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

const headerHelpByRoute: Record<TabRoutes, SupportRequestParams> = {
  BARCODE_SCAN: {},
  MESSAGES_HOME: {
    faqCategories: ["messages"],
    contextualHelpMarkdown: {
      title: "messages.contextualHelpTitle",
      body: "messages.contextualHelpContent"
    }
  },
  PROFILE_MAIN: {
    faqCategories: ["profile"],
    contextualHelpMarkdown: {
      title: "profile.main.contextualHelpTitle",
      body: "profile.main.contextualHelpContent"
    }
  },
  SERVICES_HOME: {
    faqCategories: ["services"],
    contextualHelpMarkdown: {
      title: "services.contextualHelpTitle",
      body: "services.contextualHelpContent"
    }
  },
  WALLET_HOME: {
    faqCategories: ["wallet", "wallet_methods"],
    contextualHelpMarkdown: {
      title: "wallet.contextualHelpTitle",
      body: "wallet.contextualHelpContent"
    }
  }
};

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const startupLoaded = useIOSelector(isStartupLoaded);
  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const [currentRoute, setCurrentRoute] = React.useState<
    keyof MainTabParamsList
  >(ROUTES.MESSAGES_HOME);

  const requestParams = useMemo(
    () => headerHelpByRoute[currentRoute],
    [currentRoute]
  );
  const { bottomSheet, present } = useWalletHomeHeaderBottomSheet();

  const startSupportRequest = useStartSupportRequest(requestParams);
  const helpAction: ActionProp = useMemo(
    () => ({
      icon: "help",
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      onPress: startSupportRequest
    }),
    [startSupportRequest]
  );
  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    switch (currentRoute) {
      case "SERVICES_HOME":
        return {
          title: I18n.t("services.title"),
          type: "twoActions",
          firstAction: helpAction,
          secondAction: {
            icon: "coggle",
            accessibilityLabel: I18n.t("global.buttons.edit"),
            onPress: () => {
              navigateToServicePreferenceScreen();
            }
          }
        };
      case "PROFILE_MAIN":
        return {
          title: I18n.t("profile.main.title"),
          type: "singleAction",
          firstAction: helpAction
        };
      case "MESSAGES_HOME":
        return {
          title: I18n.t("messages.contentTitle"),
          type: "twoActions",
          firstAction: helpAction,
          secondAction: {
            icon: "search",
            accessibilityLabel: "ricerca",
            onPress: () => {
              dispatch(searchMessagesEnabled(true));
            }
          }
        };
      case "BARCODE_SCAN":
      case "WALLET_HOME":
        return {
          title: I18n.t("wallet.wallet"),
          type: "twoActions",
          firstAction: helpAction,
          secondAction: {
            icon: "add",
            accessibilityLabel: I18n.t("wallet.accessibility.addElement"),
            onPress: present
          }
        };
    }
  }, [currentRoute, helpAction, present, dispatch]);

  useEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel {...headerProps} />
    });
  }, [headerProps, navigation, currentRoute]);

  const navigateToBarcodeScanScreen = () => {
    navigation.navigate(ROUTES.BARCODE_SCAN);
  };

  return (
    <LoadingSpinnerOverlay
      isLoading={startupLoaded === StartupStatusEnum.ONBOARDING}
      loadingOpacity={1}
    >
      {bottomSheet}
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
          name={ROUTES.MESSAGES_HOME}
          component={MessagesHomeScreen}
          listeners={{
            tabPress: _ => {
              setCurrentRoute(ROUTES.MESSAGES_HOME);
            }
          }}
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
          listeners={{
            tabPress: _ => {
              setCurrentRoute(ROUTES.WALLET_HOME);
            }
          }}
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
          listeners={{
            tabPress: _ => {
              setCurrentRoute(ROUTES.SERVICES_HOME);
            }
          }}
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
          listeners={{
            tabPress: _ => {
              setCurrentRoute(ROUTES.PROFILE_MAIN);
            }
          }}
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

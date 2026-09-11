import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import {
  IOColors,
  makeFontStyleObject,
  useIOTheme
} from "@io-app/design-system";
import I18n from "i18next";

import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { MessagesHomeScreen } from "../features/messages/screens/MessagesHomeScreen";
import { PaymentsHomeScreen } from "../features/payments/home/screens/PaymentsHomeScreen";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { ServicesHomeScreen } from "../features/services/home/screens/ServicesHomeScreen";
import { WalletHomeScreen } from "../features/wallet/screens/WalletHomeScreen";
import { useBottomTabNavigatorStyle } from "../hooks/useBottomTabNavigatorStyle";
import { useIOSelector } from "../store/hooks";
import { fontPreferenceSelector } from "../store/reducers/persistedPreferences";
import { isStartupLoaded, StartupStatusEnum } from "../store/reducers/startup";
import { useIONavigation } from "./params/AppParamsList";
import { MainTabParamsList } from "./params/MainTabParamsList";
import ROUTES from "./routes";

const Tab = createNativeBottomTabNavigator<MainTabParamsList>();

export const MainTabNavigator = () => {
  const theme = useIOTheme();
  const navigation = useIONavigation();

  const startupLoaded = useIOSelector(isStartupLoaded);
  const typefacePreference = useIOSelector(fontPreferenceSelector);

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
        labeled
        minimizeBehavior="onScrollDown"
        screenOptions={{
          tabBarLabelStyle: makeFontStyleObject(
            11,
            typefacePreference === "comfortable"
              ? "Titillio"
              : "TitilliumSansPro",
            14,
            "Regular"
          ),
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: false,
          tabBarActiveTintColor: IOColors[theme["interactiveElem-default"]],
          tabBarInactiveTintColor: IOColors[theme["textBody-tertiary"]],
          tabBarStyle,
          scrollEdgeAppearance: "opaque"
        }}
      >
        <Tab.Screen
          component={MessagesHomeScreen}
          name={MESSAGES_ROUTES.MESSAGES_HOME}
          options={{
            title: I18n.t("global.navigator.messages"),
            tabBarIcon: () => ({
              uri: "https://raw.githubusercontent.com/pagopa/io-app/refs/heads/master/libs/design-system/src/components/icons/svg/originals/IconNavMessages.svg"
            })
          }}
        />
        <Tab.Screen
          component={WalletHomeScreen}
          name={ROUTES.WALLET_HOME}
          options={{
            title: I18n.t("global.navigator.wallet"),
            tabBarIcon: () => ({
              uri: "https://raw.githubusercontent.com/pagopa/io-app/refs/heads/master/libs/design-system/src/components/icons/svg/originals/IconNavWallet.svg"
            })
          }}
        />

        <Tab.Screen
          component={EmptyComponent}
          listeners={{
            tabPress: () => navigateToBarcodeScanScreen()
          }}
          name={ROUTES.BARCODE_SCAN_TAB_EMPTY}
          options={{
            preventsDefault: true,
            title: I18n.t("global.navigator.scan"),
            tabBarIcon: () => ({
              uri: "https://raw.githubusercontent.com/pagopa/io-app/refs/heads/master/libs/design-system/src/components/icons/svg/originals/IconNavScan.svg"
            }),
            tabBarIconRenderingMode: "automatic"
          }}
        />

        <Tab.Screen
          component={PaymentsHomeScreen}
          name={ROUTES.PAYMENTS_HOME}
          options={{
            title: I18n.t("global.navigator.payments"),
            tabBarIcon: () => ({
              uri: "https://raw.githubusercontent.com/pagopa/io-app/refs/heads/master/libs/design-system/src/components/icons/svg/originals/IconCreditCard.svg"
            })
          }}
        />

        <Tab.Screen
          component={ServicesHomeScreen}
          name={SERVICES_ROUTES.SERVICES_HOME}
          options={{
            title: I18n.t("global.navigator.services"),
            tabBarIcon: () => ({
              uri: "https://raw.githubusercontent.com/pagopa/io-app/refs/heads/master/libs/design-system/src/components/icons/svg/originals/IconNavServices.svg"
            })
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

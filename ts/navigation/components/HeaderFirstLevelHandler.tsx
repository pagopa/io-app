import { ActionProp, HeaderFirstLevel } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { ComponentProps, useCallback, useMemo } from "react";
import { useWalletHomeHeaderBottomSheet } from "../../components/wallet/WalletHomeHeader";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { searchMessagesEnabled } from "../../store/actions/search";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { MainTabParamsList } from "../params/MainTabParamsList";
import ROUTES from "../routes";
import { useIONavigation } from "../params/AppParamsList";
import { isNewPaymentSectionEnabledSelector } from "../../store/reducers/backendStatus";
import * as analytics from "../../features/services/common/analytics";
import { showBarcodeScanSection } from "../../config";

type HeaderFirstLevelProps = ComponentProps<typeof HeaderFirstLevel>;
type TabRoutes = keyof MainTabParamsList;

const headerHelpByRoute: Record<TabRoutes, SupportRequestParams> = {
  [MESSAGES_ROUTES.MESSAGES_HOME]: {
    faqCategories: ["messages"],
    contextualHelpMarkdown: {
      title: "messages.contextualHelpTitle",
      body: "messages.contextualHelpContent"
    }
  },
  // TODO: delete this route when the showBarcodeScanSection FF will be deleted
  [ROUTES.PROFILE_MAIN]: {
    faqCategories: ["profile"],
    contextualHelpMarkdown: {
      title: "profile.main.contextualHelpTitle",
      body: showBarcodeScanSection
        ? "profile.main.contextualHelpContentNew"
        : "profile.main.contextualHelpContent"
    }
  },
  [SERVICES_ROUTES.SERVICES_HOME]: {
    faqCategories: ["services"],
    contextualHelpMarkdown: {
      title: "services.contextualHelpTitle",
      body: "services.contextualHelpContent"
    }
  },
  [ROUTES.WALLET_HOME]: {
    faqCategories: ["wallet", "wallet_methods"],
    contextualHelpMarkdown: {
      title: "wallet.contextualHelpTitle",
      body: "wallet.contextualHelpContent"
    }
  },
  [ROUTES.BARCODE_SCAN]: {},
  [ROUTES.PAYMENTS_HOME]: {
    faqCategories: ["wallet", "wallet_methods"],
    contextualHelpMarkdown: {
      title: "wallet.contextualHelpTitle",
      body: "wallet.contextualHelpContent"
    }
  }
};

type Props = {
  currentRouteName: TabRoutes;
};
/**
 * This Component aims to handle the header of the first level screens. based on the current route
 * it will set the header title and the contextual help and the actions related to the screen
 * THIS COMPONENT IS NOT MEANT TO BE USED OUTSIDE THE NAVIGATION.
 * THIS COMPONENT WILL BE REMOVED ONCE REACT NAVIGATION WILL BE UPGRADED TO V6
 */
export const HeaderFirstLevelHandler = ({ currentRouteName }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isNewWalletSectionEnabled = useIOSelector(
    isNewPaymentSectionEnabledSelector
  );

  const navigateToSettingMainScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);

  const navigateToProfilePrefercesScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_SERVICES
    });
  }, [navigation]);

  const settingsAction: ActionProp = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: navigateToSettingMainScreen
    }),
    [navigateToSettingMainScreen]
  );

  const searchMessageAction: ActionProp = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: () => {
        dispatch(searchMessagesEnabled(true));
      }
    }),
    [dispatch]
  );

  const requestParams = useMemo(
    () =>
      pipe(
        headerHelpByRoute[currentRouteName as TabRoutes],
        O.fromNullable,
        O.getOrElse(() => ({}))
      ),
    [currentRouteName]
  );
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

  const {
    bottomSheet: WalletHomeHeaderBottomSheet,
    present: presentWalletHomeHeaderBottomsheet
  } = useWalletHomeHeaderBottomSheet();

  const walletAction: ActionProp = useMemo(
    () => ({
      icon: "add",
      accessibilityLabel: I18n.t("wallet.accessibility.addElement"),
      onPress: presentWalletHomeHeaderBottomsheet,
      testID: "walletAddNewPaymentMethodTestId"
    }),
    [presentWalletHomeHeaderBottomsheet]
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    switch (currentRouteName) {
      case SERVICES_ROUTES.SERVICES_HOME:
        return {
          title: I18n.t("services.title"),
          type: "threeActions",
          firstAction: helpAction,
          secondAction: {
            icon: "coggle",
            accessibilityLabel: showBarcodeScanSection
              ? I18n.t("global.buttons.settings")
              : I18n.t("global.buttons.edit"),
            onPress: showBarcodeScanSection
              ? navigateToSettingMainScreen
              : navigateToProfilePrefercesScreen
          },
          thirdAction: {
            icon: "search",
            accessibilityLabel: I18n.t("global.accessibility.search"),
            onPress: () => {
              analytics.trackSearchStart({ source: "header_icon" });
              navigation.navigate(SERVICES_ROUTES.SEARCH);
            }
          }
        };
      // TODO: delete this route when the showBarcodeScanSection FF will be deleted
      case ROUTES.PROFILE_MAIN:
        return {
          title: I18n.t("profile.main.title"),
          type: "singleAction",
          firstAction: helpAction
        };
      case ROUTES.WALLET_HOME:
        if (isNewWalletSectionEnabled) {
          return {
            title: I18n.t("wallet.wallet"),
            firstAction: helpAction,
            testID: "wallet-home-header-title",
            ...(showBarcodeScanSection
              ? {
                  type: "twoActions",
                  secondAction: settingsAction
                }
              : { type: "singleAction" })
          };
        }
        return {
          title: I18n.t("wallet.wallet"),
          firstAction: helpAction,
          backgroundColor: "dark",
          testID: "wallet-home-header-title",
          ...(showBarcodeScanSection
            ? {
                type: "threeActions",
                secondAction: settingsAction,
                thirdAction: walletAction
              }
            : {
                type: "twoActions",
                secondAction: walletAction
              })
        };
      case ROUTES.PAYMENTS_HOME:
        return {
          title: I18n.t("features.payments.title"),
          firstAction: helpAction,
          ...(showBarcodeScanSection
            ? {
                type: "twoActions",
                secondAction: settingsAction
              }
            : { type: "singleAction" })
        };
      case MESSAGES_ROUTES.MESSAGES_HOME:
      default:
        return {
          title: I18n.t("messages.contentTitle"),
          firstAction: helpAction,
          ...(showBarcodeScanSection
            ? {
                type: "threeActions",
                secondAction: settingsAction,
                thirdAction: searchMessageAction
              }
            : {
                type: "twoActions",
                secondAction: searchMessageAction
              })
        };
    }
  }, [
    currentRouteName,
    helpAction,
    isNewWalletSectionEnabled,
    navigateToProfilePrefercesScreen,
    navigateToSettingMainScreen,
    navigation,
    searchMessageAction,
    settingsAction,
    walletAction
  ]);

  return (
    <>
      <HeaderFirstLevel {...headerProps} />
      {WalletHomeHeaderBottomSheet}
    </>
  );
};

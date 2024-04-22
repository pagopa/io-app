import { ActionProp, HeaderFirstLevel } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { ComponentProps, useMemo } from "react";
import { useWalletHomeHeaderBottomSheet } from "../../components/wallet/WalletHomeHeader";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { navigateToServicePreferenceScreen } from "../../store/actions/navigation";
import { searchMessagesEnabled } from "../../store/actions/search";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isNewWalletSectionEnabledSelector } from "../../store/reducers/persistedPreferences";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { MainTabParamsList } from "../params/MainTabParamsList";
import ROUTES from "../routes";

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
  [ROUTES.PROFILE_MAIN]: {
    faqCategories: ["profile"],
    contextualHelpMarkdown: {
      title: "profile.main.contextualHelpTitle",
      body: "profile.main.contextualHelpContent"
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

  const isNewWalletSectionEnabled = useIOSelector(
    isNewWalletSectionEnabledSelector
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

  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    switch (currentRouteName) {
      case SERVICES_ROUTES.SERVICES_HOME:
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
      case ROUTES.PROFILE_MAIN:
        return {
          title: I18n.t("profile.main.title"),
          backgroundColor: "dark",
          type: "singleAction",
          firstAction: helpAction
        };
      case ROUTES.WALLET_HOME:
        if (isNewWalletSectionEnabled) {
          return {
            title: I18n.t("wallet.wallet"),
            type: "singleAction",
            firstAction: helpAction,
            testID: "wallet-home-header-title"
          };
        }
        return {
          title: I18n.t("wallet.wallet"),
          type: "twoActions",
          firstAction: helpAction,
          backgroundColor: "dark",
          testID: "wallet-home-header-title",
          secondAction: {
            icon: "add",
            accessibilityLabel: I18n.t("wallet.accessibility.addElement"),
            onPress: presentWalletHomeHeaderBottomsheet,
            testID: "walletAddNewPaymentMethodTestId"
          }
        };
      case ROUTES.PAYMENTS_HOME:
        return {
          title: I18n.t("features.payments.title"),
          type: "singleAction",
          firstAction: helpAction
        };
      case MESSAGES_ROUTES.MESSAGES_HOME:
      default:
        return {
          title: I18n.t("messages.contentTitle"),
          type: "twoActions",
          firstAction: helpAction,
          secondAction: {
            icon: "search",
            accessibilityLabel: I18n.t("global.accessibility.search"),
            onPress: () => {
              dispatch(searchMessagesEnabled(true));
            }
          }
        };
    }
  }, [
    currentRouteName,
    helpAction,
    presentWalletHomeHeaderBottomsheet,
    isNewWalletSectionEnabled,
    dispatch
  ]);

  return (
    <>
      <HeaderFirstLevel {...headerProps} />
      {WalletHomeHeaderBottomSheet}
    </>
  );
};

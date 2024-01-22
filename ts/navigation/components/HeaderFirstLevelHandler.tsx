/* eslint-disable functional/immutable-data */
import React, { ComponentProps, useEffect, useMemo } from "react";
import { ActionProp, HeaderFirstLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { MainTabParamsList } from "../params/MainTabParamsList";
import { useWalletHomeHeaderBottomSheet } from "../../components/wallet/WalletHomeHeader";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { navigateToServicePreferenceScreen } from "../../store/actions/navigation";
import { searchMessagesEnabled } from "../../store/actions/search";
import { currentRouteSelector } from "../../store/reducers/navigation";

type HeaderFirstLevelProps = ComponentProps<typeof HeaderFirstLevel>;
type TabRoutes =
  | Exclude<keyof MainTabParamsList, "MESSAGES_HOME" | "SERVICES_HOME">
  | "MESSAGES_INBOX"
  | "MESSAGES_ARCHIVE"
  | "SERVICES_NATIONAL"
  | "SERVICES_LOCAL";

const headerHelpByRoute: Record<TabRoutes, SupportRequestParams> = {
  BARCODE_SCAN: {},
  MESSAGES_ARCHIVE: {
    faqCategories: ["messages"],
    contextualHelpMarkdown: {
      title: "messages.contextualHelpTitle",
      body: "messages.contextualHelpContent"
    }
  },
  MESSAGES_INBOX: {
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
  SERVICES_NATIONAL: {
    faqCategories: ["services"],
    contextualHelpMarkdown: {
      title: "services.contextualHelpTitle",
      body: "services.contextualHelpContent"
    }
  },
  SERVICES_LOCAL: {
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

/**
 * This Component aims to handle the header of the first level screens. based on the current route
 * it will set the header title and the contextual help and the actions related to the screen
 * THIS COMPONENT IS NOT MEANT TO BE USED OUTSIDE THE NAVIGATION.
 * THIS COMPONENT WILL BE REMOVED ONCE REACT NAVIGATION WILL BE UPGRADED TO V6
 */
export const HeaderFirstLevelHandler = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const currentRouteName = useIOSelector(currentRouteSelector);
  // console.log("currentRouteName", currentRouteName);
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
  const headerPropsRef = React.useRef<HeaderFirstLevelProps>({
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
  });

  const {
    bottomSheet: WalletHomeHeaderBottomSheet,
    present: presentWalletHomeHeaderBottomsheet
  } = useWalletHomeHeaderBottomSheet();

  useEffect(() => {
    switch (currentRouteName) {
      case "SERVICES_NATIONAL":
      case "SERVICES_LOCAL":
        headerPropsRef.current = {
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
        break;
      case "PROFILE_MAIN":
        headerPropsRef.current = {
          title: I18n.t("profile.main.title"),
          backgroundColor: "dark",
          type: "singleAction",
          firstAction: helpAction
        };
        break;
      case "MESSAGES_INBOX":
      case "MESSAGES_ARCHIVE":
        headerPropsRef.current = {
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
        break;
      case "BARCODE_SCAN":
      case "WALLET_HOME":
        headerPropsRef.current = {
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
        break;
      default:
        break;
    }
    navigation.setOptions({
      header: () => <HeaderFirstLevel {...headerPropsRef.current} />
    });
  }, [
    navigation,
    currentRouteName,
    helpAction,
    presentWalletHomeHeaderBottomsheet,
    dispatch
  ]);

  return <>{WalletHomeHeaderBottomSheet}</>;
};

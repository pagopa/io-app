import { HeaderActionProps } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import I18n from "i18next";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { MainTabParamsList } from "../navigation/params/MainTabParamsList";
import ROUTES from "../navigation/routes";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "./useStartSupportRequest";

type TabRoutes = keyof MainTabParamsList;

const headerHelpByRoute: Record<TabRoutes, SupportRequestParams> = {
  [MESSAGES_ROUTES.MESSAGES_HOME]: {
    faqCategories: ["messages"],
    contextualHelpMarkdown: {
      title: "messages.contextualHelpTitle",
      body: "messages.contextualHelpContent"
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
  [ROUTES.BARCODE_SCAN_TAB_EMPTY]: {},
  [ROUTES.PAYMENTS_HOME]: {
    faqCategories: ["wallet", "wallet_methods"],
    contextualHelpMarkdown: {
      title: "wallet.contextualHelpTitle",
      body: "wallet.contextualHelpContent"
    }
  }
};

/**
 * This hook returns a prop object to be applied to the headers (both first and second level)
 */
export const useHeaderFirstLevelActionPropHelp = (
  currentRouteName: TabRoutes
): HeaderActionProps => {
  const requestParams = useMemo(
    () => headerHelpByRoute[currentRouteName] ?? {},
    [currentRouteName]
  );

  const startSupportRequest = useStartSupportRequest(requestParams);

  return useMemo(
    () => ({
      icon: "help",
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      onPress: startSupportRequest
    }),
    [startSupportRequest]
  );
};

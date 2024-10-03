import { ActionProp } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import I18n from "../i18n";
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
  // TODO: delete this route when the showBarcodeScanSection
  // and isSettingsVisibleAndHideProfileSelector FF will be deleted
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

/**
 * This hook returns a prop object to be applied to the headers (both first and second level)
 */
export const useHeaderFirstLevelActionPropHelp = (
  currentRouteName: TabRoutes
): ActionProp => {
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

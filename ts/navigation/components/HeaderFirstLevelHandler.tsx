import {
  HeaderActionProps,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { ComponentProps, useCallback, useMemo } from "react";
import { useServicesHomeBottomSheet } from "../../features/services/home/hooks/useServicesHomeBottomSheet";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { useIODispatch, useIOStore } from "../../store/hooks";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { MainTabParamsList } from "../params/MainTabParamsList";
import ROUTES from "../routes";
import { useIONavigation } from "../params/AppParamsList";
import * as analytics from "../../features/services/common/analytics";
import {
  isArchivingInProcessingModeSelector,
  isArchivingInSchedulingModeSelector
} from "../../features/messages/store/reducers/archiving";
import { resetMessageArchivingAction } from "../../features/messages/store/actions/archiving";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

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
  const alertProps = useStatusAlertProps(currentRouteName);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const store = useIOStore();

  const {
    bottomSheet: ServicesHomeBottomSheet,
    present: presentServicesHomeBottomSheet
  } = useServicesHomeBottomSheet();

  const canNavigateIfIsArchivingCallback = useCallback(() => {
    const state = store.getState();
    // If the system is busy archiving or restoring messages,
    // a new action (e.g. searching or navigating to settings) cannot be initiated
    const isProcessingArchiveQueue = isArchivingInProcessingModeSelector(state);
    if (isProcessingArchiveQueue) {
      return false;
    }
    // If the user was choosing which messages to archive/restore,
    // disable it before starting a new action (e.g. searching or
    // navigating to settings), as the tab bar at the bottom is
    // hidden and the new action could trigger a navigation flow back
    // to another tab on the main screen without this bar being displayed.
    const isSchedulingArchiving = isArchivingInSchedulingModeSelector(state);
    if (isSchedulingArchiving) {
      // Auto-reset does not provide feedback to the user
      dispatch(resetMessageArchivingAction(undefined));
    }
    return true;
  }, [dispatch, store]);

  const messageSearchCallback = useCallback(() => {
    if (canNavigateIfIsArchivingCallback()) {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_SEARCH);
    }
  }, [canNavigateIfIsArchivingCallback, navigation]);

  const handleSearchInstituion = useCallback(() => {
    analytics.trackSearchStart({ source: "header_icon" });
    navigation.navigate(SERVICES_ROUTES.SEARCH);
  }, [navigation]);

  const navigateToSettingMainScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);

  const navigateToSettingMainScreenFromMessageSection = useCallback(() => {
    if (canNavigateIfIsArchivingCallback()) {
      navigateToSettingMainScreen();
    }
  }, [canNavigateIfIsArchivingCallback, navigateToSettingMainScreen]);

  const settingsAction: HeaderActionProps = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: navigateToSettingMainScreen
    }),
    [navigateToSettingMainScreen]
  );

  const settingsActionInMessageSection: HeaderActionProps = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: navigateToSettingMainScreenFromMessageSection
    }),
    [navigateToSettingMainScreenFromMessageSection]
  );

  const settingsActionInServicesSection: HeaderActionProps = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: presentServicesHomeBottomSheet
    }),
    [presentServicesHomeBottomSheet]
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
  const helpAction: HeaderActionProps = useMemo(
    () => ({
      icon: "help",
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      onPress: startSupportRequest
    }),
    [startSupportRequest]
  );

  const searchMessageAction: HeaderActionProps = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: messageSearchCallback
    }),
    [messageSearchCallback]
  );

  const searchInstitutionAction: HeaderActionProps = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: handleSearchInstituion
    }),
    [handleSearchInstituion]
  );

  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    const commonProp = {
      ignoreSafeAreaMargin: !!alertProps
    };
    switch (currentRouteName) {
      case SERVICES_ROUTES.SERVICES_HOME:
        return {
          ...commonProp,
          title: I18n.t("services.title"),
          type: "threeActions",
          firstAction: helpAction,
          secondAction: settingsActionInServicesSection,
          thirdAction: searchInstitutionAction
        };
      case ROUTES.WALLET_HOME:
        return {
          title: I18n.t("wallet.wallet"),
          firstAction: helpAction,
          testID: "wallet-home-header-title",
          type: "twoActions",
          secondAction: settingsAction
        };
      case ROUTES.PAYMENTS_HOME:
        return {
          ...commonProp,
          title: I18n.t("features.payments.title"),
          firstAction: helpAction,
          type: "twoActions",
          secondAction: settingsAction
        };
      case MESSAGES_ROUTES.MESSAGES_HOME:
      default:
        return {
          ...commonProp,
          skipHeaderAutofocus: true,
          title: I18n.t("messages.contentTitle"),
          firstAction: helpAction,
          type: "threeActions",
          secondAction: settingsActionInMessageSection,
          thirdAction: searchMessageAction
        };
    }
  }, [
    alertProps,
    currentRouteName,
    helpAction,
    settingsActionInServicesSection,
    searchInstitutionAction,
    settingsAction,
    settingsActionInMessageSection,
    searchMessageAction
  ]);

  return (
    <>
      <HeaderFirstLevel {...headerProps} />
      {ServicesHomeBottomSheet}
    </>
  );
};

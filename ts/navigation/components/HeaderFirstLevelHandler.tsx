import { ActionProp } from "@pagopa/io-app-design-system";

import React, { ComponentProps, useCallback, useMemo } from "react";
import HeaderFirstLevel from "../../components/ui/HeaderFirstLevel";
import { useWalletHomeHeaderBottomSheet } from "../../components/wallet/WalletHomeHeader";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import { resetMessageArchivingAction } from "../../features/messages/store/actions/archiving";
import {
  isArchivingInProcessingModeSelector,
  isArchivingInSchedulingModeSelector
} from "../../features/messages/store/reducers/archiving";
import { useHeaderFirstLevelActionPropHelp } from "../../hooks/useHeaderFirstLevelActionPropHelp";
import I18n from "../../i18n";
import { useIODispatch, useIOSelector, useIOStore } from "../../store/hooks";
import {
  isNewPaymentSectionEnabledSelector,
  isSettingsVisibleAndHideProfileSelector
} from "../../store/reducers/backendStatus";
import { useIONavigation } from "../params/AppParamsList";
import { MainTabParamsList } from "../params/MainTabParamsList";
import ROUTES from "../routes";

type HeaderFirstLevelProps = ComponentProps<typeof HeaderFirstLevel>;

type HeaderFirstLevelHandlerProps = {
  currentRouteName: keyof MainTabParamsList;
};

/**
 * This Component aims to handle the header of the first level screens. based on the current route
 * it will set the header title and the contextual help and the actions related to the screen
 * THIS COMPONENT IS NOT MEANT TO BE USED OUTSIDE THE NAVIGATION.
 * THIS COMPONENT WILL BE REMOVED ONCE REACT NAVIGATION WILL BE UPGRADED TO V6
 */
export const HeaderFirstLevelHandler = ({
  currentRouteName
}: HeaderFirstLevelHandlerProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const store = useIOStore();

  const isNewWalletSectionEnabled = useIOSelector(
    isNewPaymentSectionEnabledSelector
  );

  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

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

  const settingsAction: ActionProp = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: navigateToSettingMainScreen
    }),
    [navigateToSettingMainScreen]
  );

  const settingsActionInMessageSection: ActionProp = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: navigateToSettingMainScreenFromMessageSection
    }),
    [navigateToSettingMainScreenFromMessageSection]
  );

  const helpAction = useHeaderFirstLevelActionPropHelp(currentRouteName);

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

  const searchMessageAction: ActionProp = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: messageSearchCallback
    }),
    [messageSearchCallback]
  );

  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    switch (currentRouteName) {
      case ROUTES.WALLET_HOME:
        if (isNewWalletSectionEnabled) {
          return {
            title: I18n.t("wallet.wallet"),
            firstAction: helpAction,
            testID: "wallet-home-header-title",
            ...(isSettingsVisibleAndHideProfile
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
          ...(isSettingsVisibleAndHideProfile
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
          ...(isSettingsVisibleAndHideProfile
            ? {
                type: "twoActions",
                secondAction: settingsAction
              }
            : { type: "singleAction" })
        };
      case MESSAGES_ROUTES.MESSAGES_HOME:
      default:
        return {
          skipHeaderAutofocus: true,
          title: I18n.t("messages.contentTitle"),
          firstAction: helpAction,
          ...(isSettingsVisibleAndHideProfile
            ? {
                type: "threeActions",
                secondAction: settingsActionInMessageSection,
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
    isSettingsVisibleAndHideProfile,
    searchMessageAction,
    settingsAction,
    settingsActionInMessageSection,
    walletAction
  ]);

  return (
    <>
      <HeaderFirstLevel {...headerProps} />
      {WalletHomeHeaderBottomSheet}
    </>
  );
};

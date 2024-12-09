import {
  HeaderActionProps,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import React, { ComponentProps, useCallback, useMemo } from "react";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import { resetMessageArchivingAction } from "../../features/messages/store/actions/archiving";
import {
  isArchivingInProcessingModeSelector,
  isArchivingInSchedulingModeSelector
} from "../../features/messages/store/reducers/archiving";
import { useHeaderFirstLevelActionPropHelp } from "../../hooks/useHeaderFirstLevelActionPropHelp";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";
import I18n from "../../i18n";
import { useIODispatch, useIOStore } from "../../store/hooks";
import { useIONavigation } from "../params/AppParamsList";
import { MainTabParamsList } from "../params/MainTabParamsList";
import ROUTES from "../routes";

type HeaderFirstLevelProps = ComponentProps<typeof HeaderFirstLevel>;

type HeaderFirstLevelHandlerProps = {
  currentRouteName: keyof MainTabParamsList;
};

const useNavigateToSettingMainScreen = () => {
  const navigation = useIONavigation();

  return useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);
};

export const useHeaderFirstLevelActionPropSettings = (): HeaderActionProps => ({
  icon: "coggle",
  accessibilityLabel: I18n.t("global.buttons.settings"),
  onPress: useNavigateToSettingMainScreen()
});

/**
 * This Component aims to handle the header of the first level screens. based on the current route
 * it will set the header title and the contextual help and the actions related to the screen
 * THIS COMPONENT IS NOT MEANT TO BE USED OUTSIDE THE NAVIGATION.
 * THIS COMPONENT WILL BE REMOVED ONCE REACT NAVIGATION WILL BE UPGRADED TO V6
 */
export const HeaderFirstLevelHandler = ({
  currentRouteName
}: HeaderFirstLevelHandlerProps) => {
  const alertProps = useStatusAlertProps(currentRouteName);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const store = useIOStore();

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

  const navigateToSettingMainScreen = useNavigateToSettingMainScreen();

  const navigateToSettingMainScreenFromMessageSection = useCallback(() => {
    if (canNavigateIfIsArchivingCallback()) {
      navigateToSettingMainScreen();
    }
  }, [canNavigateIfIsArchivingCallback, navigateToSettingMainScreen]);

  const settingsAction = useHeaderFirstLevelActionPropSettings();
  const helpAction = useHeaderFirstLevelActionPropHelp(currentRouteName);

  const settingsActionInMessageSection: HeaderActionProps = useMemo(
    () => ({
      ...settingsAction,
      onPress: navigateToSettingMainScreenFromMessageSection
    }),
    [navigateToSettingMainScreenFromMessageSection, settingsAction]
  );

  const searchMessageAction: HeaderActionProps = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: messageSearchCallback
    }),
    [messageSearchCallback]
  );

  const headerProps: HeaderFirstLevelProps = useMemo(() => {
    const commonProp = {
      ignoreSafeAreaMargin: !!alertProps
    };
    switch (currentRouteName) {
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
    settingsActionInMessageSection,
    searchMessageAction
  ]);

  return <HeaderFirstLevel {...headerProps} />;
};

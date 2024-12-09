import { HeaderActionProps, IOStyles } from "@pagopa/io-app-design-system";
import React, {
  ComponentProps,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import HeaderFirstLevel from "../../../components/ui/HeaderFirstLevel";
import { useHeaderFirstLevelActionPropHelp } from "../../../hooks/useHeaderFirstLevelActionPropHelp";
import {
  useHeaderFirstLevelActionPropSettings,
  useNavigateToSettingMainScreen
} from "../../../hooks/useHeaderFirstLevelActionPropSettings";
import { useStatusAlertProps } from "../../../hooks/useStatusAlertProps";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../store/hooks";
import { useEngagementScreen } from "../../pushNotifications/hooks/useEngagementScreen";
import { PagerViewContainer } from "../components/Home/PagerViewContainer";
import { Preconditions } from "../components/Home/Preconditions";
import { SecuritySuggestions } from "../components/Home/SecuritySuggestions";
import { TabNavigationContainer } from "../components/Home/TabNavigationContainer";
import { Toasts } from "../components/Home/Toasts";
import { MESSAGES_ROUTES } from "../navigation/routes";
import { resetMessageArchivingAction } from "../store/actions/archiving";
import {
  isArchivingInProcessingModeSelector,
  isArchivingInSchedulingModeSelector
} from "../store/reducers/archiving";

export const MessagesHomeScreen = () => {
  const store = useIOStore();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const pagerViewRef = useRef<PagerView>(null);
  useEngagementScreen();

  /* CODE RELATED TO THE HEADER -- START */

  const currentRoute = MESSAGES_ROUTES.MESSAGES_HOME;

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
  const helpAction = useHeaderFirstLevelActionPropHelp(currentRoute);

  const alertProps = useStatusAlertProps(currentRoute);

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

  useLayoutEffect(() => {
    const headerFirstLevelProps: ComponentProps<typeof HeaderFirstLevel> = {
      title: I18n.t("messages.contentTitle"),
      ignoreSafeAreaMargin: !!alertProps,
      type: "threeActions",
      firstAction: helpAction,
      secondAction: settingsActionInMessageSection,
      thirdAction: searchMessageAction
    };

    navigation.setOptions({
      header: () => <HeaderFirstLevel {...headerFirstLevelProps} />
    });
  }, [
    alertProps,
    helpAction,
    navigation,
    searchMessageAction,
    settingsAction,
    settingsActionInMessageSection
  ]);

  /* CODE RELATED TO THE HEADER -- END */

  return (
    <View style={IOStyles.flex}>
      <Toasts />
      <TabNavigationContainer pagerViewRef={pagerViewRef} />
      <PagerViewContainer ref={pagerViewRef} />
      <Preconditions />
      <SecuritySuggestions />
    </View>
  );
};

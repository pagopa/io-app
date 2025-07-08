import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { hasUserSeenSystemNotificationsPromptSelector } from "../../../pushNotifications/store/selectors";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import I18n from "../../../../i18n";

const IdPayEnableNotificationScreen = () => {
  const { useActorRef } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const appState = useRef(AppState.currentState);
  const isPushNotificationEnabled = useIOSelector(
    hasUserSeenSystemNotificationsPromptSelector
  );

  const handleClosePress = () => machine.send({ type: "close" });

  const checkNotificationStatus = useCallback(() => {
    if (isPushNotificationEnabled) {
      // Notifications are now enabled, proceed to next step
      machine.send({ type: "next" }); // or whatever event you need to send
    }
  }, [isPushNotificationEnabled, machine]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground, check notification status
        checkNotificationStatus();
      }
      // eslint-disable-next-line functional/immutable-data
      appState.current = nextAppState;
    },
    [checkNotificationStatus]
  );

  useFocusEffect(
    useCallback(() => {
      // Add app state listener when screen is focused
      const subscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      );

      // Check notification status when screen is focused
      checkNotificationStatus();

      return () => {
        subscription?.remove();
      };
    }, [handleAppStateChange, checkNotificationStatus])
  );

  return (
    <OperationResultScreenContent
      pictogram="reactivate"
      title={I18n.t("idpay.onboarding.enableNotification.title")}
      subtitle={I18n.t("idpay.onboarding.enableNotification.subtitle")}
      action={{
        label: I18n.t("idpay.onboarding.enableNotification.action"),
        onPress: openSystemNotificationSettingsScreen
      }}
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableNotification.deny"),
        onPress: handleClosePress
      }}
    />
  );
};

export default IdPayEnableNotificationScreen;

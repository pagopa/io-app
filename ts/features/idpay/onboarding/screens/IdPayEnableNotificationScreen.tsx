import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { areNotificationPermissionsEnabledSelector } from "../../../appearanceSettings/store/selectors";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import { IdPayOnboardingMachineContext } from "../machine/provider";

const IdPayEnableNotificationScreen = () => {
  const { useActorRef } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isPushNotificationEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const handleClosePress = () => machine.send({ type: "close" });

  useFocusEffect(
    useCallback(() => {
      // if push notifications are enabled, close the screen
      if (isPushNotificationEnabled) {
        machine.send({ type: "close" });
      }
    }, [machine, isPushNotificationEnabled])
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

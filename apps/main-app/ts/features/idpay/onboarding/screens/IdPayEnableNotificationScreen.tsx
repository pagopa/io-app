import { Badge, IOToast, VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import {
  trackIDPayOnboardingNotificationAccepted,
  trackIDPayOnboardingNotificationActivation,
  trackIDPayOnboardingNotificationDenied,
  trackIDPayOnboardingNotificationSuccess
} from "../analytics";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayEnableNotificationScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isPushNotificationEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );
  const initiative = useSelector(selectInitiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  const handleClosePress = () => {
    trackIDPayOnboardingNotificationDenied({
      initiativeId
    });
    machine.send({ type: "close" });
  };

  useFocusEffect(
    useCallback(() => {
      // if push notifications are enabled, close the screen
      if (isPushNotificationEnabled) {
        machine.send({ type: "close" });
        trackIDPayOnboardingNotificationSuccess({
          initiativeId
        });
        IOToast.success(I18n.t("idpay.onboarding.enableNotification.success"));
      }
    }, [isPushNotificationEnabled, machine, initiativeId])
  );

  useOnFirstRender(() => {
    trackIDPayOnboardingNotificationActivation({
      initiativeId
    });
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("idpay.onboarding.enableNotification.action"),
        onPress: () => {
          trackIDPayOnboardingNotificationAccepted({
            initiativeId
          });
          openSystemNotificationSettingsScreen();
        }
      }}
      pictogram="activate"
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableNotification.deny"),
        onPress: handleClosePress
      }}
      subtitle={I18n.t("idpay.onboarding.enableNotification.subtitle")}
      title={I18n.t("idpay.onboarding.enableNotification.title")}
      topElement={
        <View style={{ alignItems: "center" }}>
          <VSpacer size={8} />
          <Badge
            text={I18n.t("idpay.onboarding.enableNotification.advice")}
            variant="highlight"
          />
          <VSpacer size={8} />
        </View>
      }
    />
  );
};

export default IdPayEnableNotificationScreen;

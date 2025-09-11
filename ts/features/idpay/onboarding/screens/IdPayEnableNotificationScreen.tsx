import { Badge, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import {
  trackIDPayOnboardingNotificationAccepted,
  trackIDPayOnboardingNotificationActivation,
  trackIDPayOnboardingNotificationDenied
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

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  const handleClosePress = () => {
    trackIDPayOnboardingNotificationDenied({
      initiativeName,
      initiativeId
    });
    machine.send({ type: "close" });
  };

  useFocusEffect(
    useCallback(() => {
      // if push notifications are enabled, close the screen
      if (isPushNotificationEnabled) {
        machine.send({ type: "close" });
        trackIDPayOnboardingNotificationAccepted({
          initiativeName,
          initiativeId
        });
        IOToast.success(I18n.t("idpay.onboarding.enableNotification.success"));
      }
    }, [isPushNotificationEnabled, machine, initiativeName, initiativeId])
  );

  return (
    <OperationResultScreenContent
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
      pictogram="activate"
      title={I18n.t("idpay.onboarding.enableNotification.title")}
      subtitle={I18n.t("idpay.onboarding.enableNotification.subtitle")}
      action={{
        label: I18n.t("idpay.onboarding.enableNotification.action"),
        onPress: () => {
          trackIDPayOnboardingNotificationActivation({
            initiativeName,
            initiativeId
          });
          openSystemNotificationSettingsScreen();
        }
      }}
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableNotification.deny"),
        onPress: handleClosePress
      }}
    />
  );
};

export default IdPayEnableNotificationScreen;

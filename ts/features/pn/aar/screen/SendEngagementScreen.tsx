import { useCallback, useEffect, useState } from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SendEngagementComponent } from "../components/SendEngagementComponent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import {
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationDismissed,
  trackSendActivationModalDialogActivationStart
} from "../analytics";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";
import { NOTIFICATIONS_ROUTES } from "../../../pushNotifications/navigation/routes";

export const SendEngagementScreen = () => {
  const [screenStatus, setScreenStatus] = useState<
    "Waiting" | "Activating" | "Failed"
  >("Waiting");
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();
  const notificationPermissionsEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const onSENDActivationSucceeded = useCallback(() => {
    toast.success(I18n.t("features.pn.aar.serviceActivation.serviceActivated"));
    if (notificationPermissionsEnabled) {
      navigation.popToTop();
    } else {
      navigation.replace(NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT, {
        flow: "send_notification_opening"
      });
    }
  }, [navigation, notificationPermissionsEnabled, toast]);
  const onSENDActivationFailed = useCallback(() => {
    navigation.setOptions({
      headerShown: false
    });
    setScreenStatus("Failed");
  }, [navigation]);

  const onActivateService = useCallback(
    (isRetry: boolean = false) => {
      trackSendActivationModalDialogActivationStart();
      if (isRetry) {
        navigation.setOptions({
          headerShown: true
        });
      }
      setScreenStatus("Activating");
      dispatch(
        pnActivationUpsert.request({
          value: true,
          onSuccess: onSENDActivationSucceeded,
          onFailure: onSENDActivationFailed
        })
      );
    },
    [dispatch, navigation, onSENDActivationFailed, onSENDActivationSucceeded]
  );
  const onClose = useCallback(() => {
    if (screenStatus !== "Activating") {
      trackSendActivationModalDialogActivationDismissed();
      navigation.popToTop();
    }
  }, [navigation, screenStatus]);

  useEffect(() => {
    if (screenStatus === "Waiting") {
      // Make sure that nothing sets screenStatus to Waiting,
      // otherwise there will be a double event tracking
      trackSendActivationModalDialog();
    } else if (screenStatus === "Failed") {
      // Here multiple tracking is fine, since we want
      // to track it every time that the user retries it
      sendBannerMixpanelEvents.bannerKO("aar");
    }
  }, [screenStatus]);

  if (screenStatus === "Failed") {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t("features.pn.aar.serviceActivation.failure")}
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: () => onActivateService(true)
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: onClose
        }}
      />
    );
  }
  return (
    <SendEngagementComponent
      isLoading={screenStatus === "Activating"}
      onPrimaryAction={onActivateService}
      onClose={onClose}
    />
  );
};

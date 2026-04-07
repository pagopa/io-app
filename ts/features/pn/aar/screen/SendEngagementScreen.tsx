import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { NOTIFICATIONS_ROUTES } from "../../../pushNotifications/navigation/routes";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";
import {
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationDismissed,
  trackSendActivationModalDialogActivationStart
} from "../../analytics/send";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { pnActivationUpsert } from "../../store/actions";
import { SendEngagementComponent } from "../components/SendEngagementComponent";

const flow: NotificationModalFlow = "send_notification_opening";

export type SendEngagementScreenNavigationParams = Readonly<{
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
}>;

type SendEngagementScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.ENGAGEMENT_SCREEN
>;

export const SendEngagementScreen = ({ route }: SendEngagementScreenProps) => {
  const { sendOpeningSource, sendUserType } = route.params;

  const [screenStatus, setScreenStatus] = useState<
    "Activating" | "Failed" | "Waiting"
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
        flow,
        sendOpeningSource,
        sendUserType
      });
    }
  }, [
    navigation,
    notificationPermissionsEnabled,
    sendOpeningSource,
    sendUserType,
    toast
  ]);
  const onSENDActivationFailed = useCallback(() => {
    navigation.setOptions({
      headerShown: false
    });
    setScreenStatus("Failed");
  }, [navigation]);

  const onActivateService = useCallback(
    (isRetry: boolean = false) => {
      trackSendActivationModalDialogActivationStart(
        flow,
        sendOpeningSource,
        sendUserType
      );
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
    [
      dispatch,
      navigation,
      onSENDActivationFailed,
      onSENDActivationSucceeded,
      sendOpeningSource,
      sendUserType
    ]
  );
  const onClose = useCallback(() => {
    if (screenStatus !== "Activating") {
      trackSendActivationModalDialogActivationDismissed(
        flow,
        sendOpeningSource,
        sendUserType
      );
      navigation.popToTop();
    }
  }, [navigation, screenStatus, sendOpeningSource, sendUserType]);

  useEffect(() => {
    if (screenStatus === "Waiting") {
      // Make sure that nothing sets screenStatus to Waiting,
      // otherwise there will be a double event tracking
      trackSendActivationModalDialog(flow, sendOpeningSource, sendUserType);
    } else if (screenStatus === "Failed") {
      // Here multiple tracking is fine, since we want
      // to track it every time that the user retries it
      sendBannerMixpanelEvents.bannerKO("aar");
    }
  }, [screenStatus, sendOpeningSource, sendUserType]);

  if (screenStatus === "Failed") {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: () => onActivateService(true)
        }}
        pictogram="umbrella"
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: onClose
        }}
        title={I18n.t("features.pn.aar.serviceActivation.failure")}
      />
    );
  }
  return (
    <SendEngagementComponent
      isLoading={screenStatus === "Activating"}
      onClose={onClose}
      onPrimaryAction={onActivateService}
    />
  );
};

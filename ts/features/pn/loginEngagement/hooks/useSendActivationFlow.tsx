import { useIOToast } from "@pagopa/io-app-design-system";
import i18next from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { NOTIFICATIONS_ROUTES } from "../../../pushNotifications/navigation/routes";

export const useSendActivationFlow = () => {
  const { popToTop, replace, navigate } = useIONavigation();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const isActivating = useIOSelector(isLoadingPnActivationSelector);
  const notificationPermissionsEnabled = useIOSelector(
    areNotificationPermissionsEnabledSelector
  );

  const onSENDActivationSucceeded = () => {
    if (notificationPermissionsEnabled) {
      popToTop();
    } else {
      replace(NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT, {
        flow: "authentication" // TODO: Ensure this is the right flow
      });
    }
    dispatch(setSendEngagementScreenHasBeenDismissed());
    toast.success(i18next.t("features.pn.loginEngagement.send.toast"));
  };
  const onSENDActivationFailed = () => {
    navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.SEND_ENGAGEMENT_ACTIVATION_ERROR
      }
    });
  };

  const requestSendActivation = () => {
    dispatch(
      pnActivationUpsert.request({
        value: true,
        onSuccess: onSENDActivationSucceeded,
        onFailure: onSENDActivationFailed
      })
    );
  };

  return {
    requestSendActivation,
    isActivating
  };
};

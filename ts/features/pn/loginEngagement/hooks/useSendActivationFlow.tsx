import { useIOToast } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import { NOTIFICATIONS_ROUTES } from "../../../pushNotifications/navigation/routes";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";

export const useSendActivationFlow = () => {
  const { popToTop, replace } = useIONavigation();
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
        flow: "access"
      });
    }
    dispatch(setSendEngagementScreenHasBeenDismissed());
    dispatch(setSecurityAdviceReadyToShow(true));
    toast.success(i18n.t("features.pn.loginEngagement.send.toast"));
  };
  const onSENDActivationFailed = () => {
    replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
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

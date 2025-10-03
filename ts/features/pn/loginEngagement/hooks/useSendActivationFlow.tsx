import { useIOToast } from "@pagopa/io-app-design-system";
import i18next from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

export const useSendActivationFlow = () => {
  const { pop, navigate } = useIONavigation();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const isActivating = useIOSelector(isLoadingPnActivationSelector);

  const onSENDActivationSucceeded = () => {
    pop();
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

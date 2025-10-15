import { useIOToast } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";

export const useSendActivationFlow = () => {
  const { pop, replace } = useIONavigation();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const isActivating = useIOSelector(isLoadingPnActivationSelector);

  const onSENDActivationSucceeded = () => {
    pop();
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

import { constNull } from "fp-ts/lib/function";
import { useIOToast } from "@pagopa/io-app-design-system";
import i18next from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnActivationUpsert } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../store/reducers/activation";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setSendEngagementScreenHasBeenDismissed } from "../store/actions";

export const useSendActivationFlow = () => {
  const { pop } = useIONavigation();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const isActivating = useIOSelector(isLoadingPnActivationSelector);

  const onSENDActivationSucceeded = () => {
    pop();
    dispatch(setSendEngagementScreenHasBeenDismissed());
    toast.success(i18next.t("features.pn.loginEngagement.send.toast"));
  };
  const onSENDActivationFailed = constNull; // TODO: Navigation to failure screen

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

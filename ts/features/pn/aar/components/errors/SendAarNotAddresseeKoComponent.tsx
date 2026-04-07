import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { sendAARDelegateUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackSendAARAccessDeniedDelegateInfo,
  trackSendAARAccessDeniedDismissed
} from "../../analytics";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarNotAddresseeKoComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const delegateUrl = useIOSelector(sendAARDelegateUrlSelector);

  const handlePrimaryButton = () => {
    trackSendAARAccessDeniedDelegateInfo();
    openWebUrl(delegateUrl);
  };
  const handleSecondaryAction = () => {
    trackSendAARAccessDeniedDismissed();
    terminateFlow();
  };

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.primaryAction"
        ),
        onPress: handlePrimaryButton,
        icon: "instruction",
        testID: "primary_button"
      }}
      isHeaderVisible
      pictogram="accessDenied"
      secondaryAction={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.secondaryAction"
        ),
        onPress: handleSecondaryAction,
        testID: "secondary_button"
      }}
      subtitle={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.body")}
      testID="SEND_AAR_NOT_ADDRESSEE"
      title={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.title")}
    />
  );
};

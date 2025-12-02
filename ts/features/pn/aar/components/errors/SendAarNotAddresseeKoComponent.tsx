import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { sendAARDelegateUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import {
  trackSendAARAccessDeniedDelegateInfo,
  trackSendAARAccessDeniedDismissed
} from "../../analytics";

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
      testID="SEND_AAR_NOT_ADDRESSEE"
      isHeaderVisible
      pictogram="accessDenied"
      title={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.title")}
      subtitle={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.body")}
      action={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.primaryAction"
        ),
        onPress: handlePrimaryButton,
        icon: "instruction",
        testID: "primary_button"
      }}
      secondaryAction={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.secondaryAction"
        ),
        onPress: handleSecondaryAction,
        testID: "secondary_button"
      }}
    />
  );
};

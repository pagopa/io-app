import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { sendAarDelegateUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import {
  trackSendAarAccessDeniedDelegateInfo,
  trackSendAarAccessDeniedDismissed
} from "../../analytics";

export const SendAarNotAddresseeKoComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const delegateUrl = useIOSelector(sendAarDelegateUrlSelector);

  const handlePrimaryButton = () => {
    trackSendAarAccessDeniedDelegateInfo();
    openWebUrl(delegateUrl);
  };
  const handleSecondaryAction = () => {
    trackSendAarAccessDeniedDismissed();
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

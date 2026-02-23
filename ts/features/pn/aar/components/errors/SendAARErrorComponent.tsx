import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../../../store/hooks";
import {
  trackSendAarErrorScreenClosure,
  trackSendAarErrorScreenDetails,
  trackSendAarErrorScreenDetailsHelp
} from "../../analytics";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import {
  currentAARFlowStateAssistanceErrorCode,
  currentAARFlowStateErrorDebugInfoSelector
} from "../../store/selectors";
import { useAarGenericErrorBottomSheet } from "./hooks/useAarGenericErrorBottomSheet";
import { SendAarZendeskSecondLevelTag } from "./hooks/useAarStartSendZendeskSupport";

export const SendAarGenericErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const assistanceErrorCode = useIOSelector(
    currentAARFlowStateAssistanceErrorCode
  );

  const { bottomSheet, present } = useAarGenericErrorBottomSheet({
    errorName: assistanceErrorCode,
    zendeskSecondLevelTag:
      SendAarZendeskSecondLevelTag.IO_PROBLEMA_NOTIFICA_SEND_QR,
    onStartAssistance: trackSendAarErrorScreenDetailsHelp
  });

  const debugInfo = useIOSelector(currentAARFlowStateErrorDebugInfoSelector);
  useDebugInfo(debugInfo);

  return (
    <>
      <OperationResultScreenContent
        testID="SEND_AAR_ERROR"
        isHeaderVisible
        pictogram="umbrella"
        title={I18n.t("features.pn.aar.flow.ko.GENERIC.title")}
        subtitle={I18n.t("features.pn.aar.flow.ko.GENERIC.body")}
        action={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.primaryAction"),
          onPress: () => {
            trackSendAarErrorScreenClosure();
            terminateFlow();
          },
          testID: "primary_button"
        }}
        secondaryAction={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.secondaryAction"),
          onPress: () => {
            trackSendAarErrorScreenDetails();
            present();
          },
          testID: "secondary_button"
        }}
      />
      {bottomSheet}
    </>
  );
};

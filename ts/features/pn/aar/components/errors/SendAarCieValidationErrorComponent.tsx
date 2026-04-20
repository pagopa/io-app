import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { sendAarInAppDelegationUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../../store/actions";
import {
  currentAarFlowStateAssistanceErrorCode,
  currentAarFlowStateErrorDebugInfoSelector
} from "../../store/selectors";
import { sendAarFlowStates } from "../../utils/stateUtils";
import {
  trackSendAarMandateCieErrorCac,
  trackSendAarMandateCieErrorClosure,
  trackSendAarMandateCieErrorDetail,
  trackSendAarMandateCieErrorDetailCode,
  trackSendAarMandateCieErrorDetailHelp,
  trackSendAarMandateCieErrorRetry
} from "../../analytics";
import { useAarGenericErrorBottomSheet } from "./hooks/useAarGenericErrorBottomSheet";
import { SendAarZendeskSecondLevelTag } from "./hooks/useAarStartSendZendeskSupport";

export const CieExpiredComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const helpCenterUrl = useIOSelector(sendAarInAppDelegationUrlSelector);
  const assistanceErrorCode = useIOSelector(
    currentAarFlowStateAssistanceErrorCode
  );

  return (
    <OperationResultScreenContent
      pictogram="cardIssue"
      testID="CieExpiredErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.body")}
      action={{
        testID: "CieExpiredHelpCenterButton",
        label: i18n.t(
          "features.pn.aar.flow.ko.cieValidation.expired.actions.primary"
        ),
        onPress: () => {
          trackSendAarMandateCieErrorCac();
          openWebUrl(helpCenterUrl);
        },
        icon: "instruction"
      }}
      secondaryAction={{
        testID: "CieExpiredCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode ?? "");
          terminateFlow();
        }
      }}
    />
  );
};
export const UnrelatedCieComponent = () => {
  const dispatch = useIODispatch();
  const { currentFlowData, terminateFlow } = useSendAarFlowManager();
  const assistanceErrorCode =
    useIOSelector(currentAarFlowStateAssistanceErrorCode) ?? "";

  const handleRetry = () => {
    trackSendAarMandateCieErrorRetry(assistanceErrorCode);
    if (
      currentFlowData.type === "ko" &&
      currentFlowData.previousState.type === sendAarFlowStates.validatingMandate
    ) {
      const {
        mandateId,
        recipientInfo,
        iun,
        unsignedVerificationCode: verificationCode
      } = currentFlowData.previousState;
      dispatch(
        setAarFlowState({
          type: sendAarFlowStates.cieCanAdvisory,
          iun,
          mandateId,
          recipientInfo,
          verificationCode
        })
      );
    }
  };

  return (
    <OperationResultScreenContent
      pictogram="attention"
      testID="UnrelatedCieErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.body")}
      action={{
        testID: "UnrelatedCieRetryButton",
        label: i18n.t("global.buttons.retry"),
        onPress: handleRetry
      }}
      secondaryAction={{
        testID: "UnrelatedCieCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode);
          terminateFlow();
        }
      }}
    />
  );
};
export const CieValidationExpiredTtlComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const assistanceErrorCode =
    useIOSelector(currentAarFlowStateAssistanceErrorCode) ?? "";

  return (
    <OperationResultScreenContent
      pictogram="ended"
      testID="CieValidationExpiredTtlErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.expiredTtl.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.expiredTtl.body")}
      action={{
        testID: "CieValidationExpiredTtlCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode);
          terminateFlow();
        }
      }}
    />
  );
};
export const GenericCieValidationErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const debugInfo = useIOSelector(currentAarFlowStateErrorDebugInfoSelector);
  const assistanceErrorCode = useIOSelector(
    currentAarFlowStateAssistanceErrorCode
  );
  const { bottomSheet, present } = useAarGenericErrorBottomSheet({
    errorName: assistanceErrorCode,
    zendeskSecondLevelTag:
      SendAarZendeskSecondLevelTag.IO_PROBLEMA_NOTIFICA_SEND_QR_ALTRA_PERSONA,
    onCopyToClipboard: () =>
      trackSendAarMandateCieErrorDetailCode(assistanceErrorCode ?? ""),
    onStartAssistance: () =>
      trackSendAarMandateCieErrorDetailHelp(assistanceErrorCode ?? "")
  });

  useDebugInfo(debugInfo);
  return (
    <>
      <OperationResultScreenContent
        testID="GenericCieValidationErrorComponent"
        pictogram="umbrella"
        title={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.title")}
        subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.body")}
        action={{
          testID: "GenericCieValidationErrorCloseButton",
          label: i18n.t("global.buttons.close"),
          onPress: () => {
            trackSendAarMandateCieErrorClosure(assistanceErrorCode ?? "");
            terminateFlow();
          }
        }}
        secondaryAction={{
          testID: "GenericCieValidationErrorSupportButton",
          label: i18n.t(
            "features.pn.aar.flow.ko.cieValidation.generic.actions.secondary"
          ),
          onPress: () => {
            trackSendAarMandateCieErrorDetail(assistanceErrorCode ?? "");
            present();
          }
        }}
      />
      {bottomSheet}
    </>
  );
};

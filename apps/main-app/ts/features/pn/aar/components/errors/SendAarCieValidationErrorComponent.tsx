import i18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { sendAarInAppDelegationUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackSendAarMandateCieErrorCac,
  trackSendAarMandateCieErrorClosure,
  trackSendAarMandateCieErrorDetail,
  trackSendAarMandateCieErrorDetailCode,
  trackSendAarMandateCieErrorDetailHelp,
  trackSendAarMandateCieErrorRetry
} from "../../analytics";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../../store/actions";
import {
  currentAarFlowStateAssistanceErrorCode,
  currentAarFlowStateErrorDebugInfoSelector
} from "../../store/selectors";
import { sendAarFlowStates } from "../../utils/stateUtils";
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
      pictogram="cardIssue"
      secondaryAction={{
        testID: "CieExpiredCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode ?? "");
          terminateFlow();
        }
      }}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.body")}
      testID="CieExpiredErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.title")}
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
      action={{
        testID: "UnrelatedCieRetryButton",
        label: i18n.t("global.buttons.retry"),
        onPress: handleRetry
      }}
      pictogram="attention"
      secondaryAction={{
        testID: "UnrelatedCieCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode);
          terminateFlow();
        }
      }}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.body")}
      testID="UnrelatedCieErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.title")}
    />
  );
};
export const CieValidationExpiredTtlComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const assistanceErrorCode =
    useIOSelector(currentAarFlowStateAssistanceErrorCode) ?? "";

  return (
    <OperationResultScreenContent
      action={{
        testID: "CieValidationExpiredTtlCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          trackSendAarMandateCieErrorClosure(assistanceErrorCode);
          terminateFlow();
        }
      }}
      pictogram="ended"
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.expiredTtl.body")}
      testID="CieValidationExpiredTtlErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.expiredTtl.title")}
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
        action={{
          testID: "GenericCieValidationErrorCloseButton",
          label: i18n.t("global.buttons.close"),
          onPress: () => {
            trackSendAarMandateCieErrorClosure(assistanceErrorCode ?? "");
            terminateFlow();
          }
        }}
        pictogram="umbrella"
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
        subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.body")}
        testID="GenericCieValidationErrorComponent"
        title={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.title")}
      />
      {bottomSheet}
    </>
  );
};

import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { sendAarInAppDelegationUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../utils/url";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../../store/actions";
import {
  currentAARFlowStateAssistanceErrorCode,
  currentAARFlowStateErrorDebugInfoSelector
} from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarErrorSupportBottomSheetComponent } from "./SendAARErrorComponent";

export const CieExpiredComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const helpCenterUrl = useIOSelector(sendAarInAppDelegationUrlSelector);

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
        onPress: () => openWebUrl(helpCenterUrl),
        icon: "instruction"
      }}
      secondaryAction={{
        testID: "CieExpiredCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: terminateFlow
      }}
    />
  );
};
export const UnrelatedCieComponent = () => {
  const dispatch = useIODispatch();
  const { currentFlowData, terminateFlow } = useSendAarFlowManager();

  const handleRetry = () => {
    if (
      currentFlowData.type === "ko" &&
      currentFlowData.previousState.type === sendAARFlowStates.validatingMandate
    ) {
      const {
        mandateId,
        recipientInfo,
        iun,
        unsignedVerificationCode: verificationCode
      } = currentFlowData.previousState;
      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.cieCanAdvisory,
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
        onPress: terminateFlow
      }}
    />
  );
};
export const GenericCieValidationErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const debugInfo = useIOSelector(currentAARFlowStateErrorDebugInfoSelector);
  const assistanceErrorCode = useIOSelector(
    currentAARFlowStateAssistanceErrorCode
  );
  const handleZendeskAssistance = () => {
    dismiss();
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    component: sendAarErrorSupportBottomSheetComponent(
      handleZendeskAssistance,
      assistanceErrorCode
    ),
    title: ""
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
          onPress: terminateFlow
        }}
        secondaryAction={{
          testID: "GenericCieValidationErrorSupportButton",
          label: i18n.t(
            "features.pn.aar.flow.ko.cieValidation.generic.actions.secondary"
          ),
          onPress: present
        }}
      />
      {bottomSheet}
    </>
  );
};

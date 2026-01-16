import { constNull } from "fp-ts/lib/function";
import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
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

  return (
    <OperationResultScreenContent
      pictogram="cardIssue"
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.expired.body")}
      action={{
        label: i18n.t(
          "features.pn.aar.flow.ko.cieValidation.expired.actions.primary"
        ),
        onPress: constNull, // navigation to the correct helpCenter page to come
        icon: "instruction"
      }}
      secondaryAction={{
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
      title={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.unrelated.body")}
      action={{
        label: i18n.t("global.buttons.retry"),
        onPress: handleRetry
      }}
      secondaryAction={{
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
        pictogram="umbrella"
        title={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.title")}
        subtitle={i18n.t("features.pn.aar.flow.ko.cieValidation.generic.body")}
        action={{
          label: i18n.t("global.buttons.close"),
          onPress: terminateFlow
        }}
        secondaryAction={{
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

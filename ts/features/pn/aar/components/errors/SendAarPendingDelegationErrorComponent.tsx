import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarPendingDelegationErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  return (
    <OperationResultScreenContent
      pictogram="pending"
      testID="PendingDelegationErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.PendingDelegation.title")}
      subtitle={i18n.t("features.pn.aar.flow.ko.PendingDelegation.body")}
      action={{
        testID: "PendingDelegationCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: terminateFlow
      }}
    />
  );
};

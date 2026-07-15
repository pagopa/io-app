import i18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarPendingDelegationErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  return (
    <OperationResultScreenContent
      action={{
        testID: "PendingDelegationCloseButton",
        label: i18n.t("global.buttons.close"),
        onPress: terminateFlow
      }}
      pictogram="pending"
      subtitle={i18n.t("features.pn.aar.flow.ko.pendingDelegation.body")}
      testID="PendingDelegationErrorComponent"
      title={i18n.t("features.pn.aar.flow.ko.pendingDelegation.title")}
    />
  );
};

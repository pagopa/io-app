import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAarPendingDelegationErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  return (
    <OperationResultScreenContent
      action={{
        testID: "PendingDelegationCloseButton",
        label: I18n.t("global.buttons.close"),
        onPress: terminateFlow
      }}
      pictogram="pending"
      subtitle={I18n.t("features.pn.aar.flow.ko.pendingDelegation.body")}
      testID="PendingDelegationErrorComponent"
      title={I18n.t("features.pn.aar.flow.ko.pendingDelegation.title")}
    />
  );
};

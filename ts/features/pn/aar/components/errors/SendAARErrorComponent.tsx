import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAARErrorComponent = () => {
  const { goToNextState, terminateFlow } = useSendAarFlowManager();

  return (
    <OperationResultScreenContent
      testID="SEND_AAR_ERROR"
      isHeaderVisible
      pictogram="accessDenied"
      title={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.title")}
      subtitle={I18n.t("features.pn.aar.flow.ko.notAddresseeFinal.body")}
      action={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.primaryAction"
        ),
        onPress: terminateFlow,
        testID: "primary-action"
      }}
      secondaryAction={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.secondaryAction"
        ),
        onPress: goToNextState,
        testID: "secondary-action"
      }}
    />
  );
};

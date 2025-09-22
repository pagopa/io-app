import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAARNotAddresseeComponent = () => {
  const { goToNextState, terminateFlow } = useSendAarFlowManager();

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
        onPress: goToNextState,
        icon: "instruction",
        testID: "primary_button"
      }}
      secondaryAction={{
        label: I18n.t(
          "features.pn.aar.flow.ko.notAddresseeFinal.secondaryAction"
        ),
        onPress: terminateFlow,
        testID: "secondary_button"
      }}
    />
  );
};

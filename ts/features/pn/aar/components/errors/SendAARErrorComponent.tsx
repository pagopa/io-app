import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";

export const SendAARErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();

  return (
    <OperationResultScreenContent
      testID="SEND_AAR_ERROR"
      isHeaderVisible
      pictogram="accessDenied"
      title="Lorem Ipsum"
      subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      action={{
        label: I18n.t("features.pn.aar.flow.ko.GENERIC.primaryAction"),
        onPress: terminateFlow,
        testID: "primary_button"
      }}
    />
  );
};

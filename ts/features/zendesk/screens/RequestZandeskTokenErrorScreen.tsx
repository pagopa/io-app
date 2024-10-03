import React, { useCallback } from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import I18n from "../../../i18n";

const RequestZandeskTokenErrorScreen = () => {
  const navigation = useIONavigation();

  const handleOnClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={I18n.t("support.errorGetZendeskToken.title")}
      subtitle={I18n.t("support.errorGetZendeskToken.subtitle")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleOnClose
      }}
    />
  );
};

export default RequestZandeskTokenErrorScreen;

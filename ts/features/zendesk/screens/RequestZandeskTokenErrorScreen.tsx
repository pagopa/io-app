import React, { useCallback } from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import { zendeskSupportCancel } from "../store/actions";

const RequestZandeskTokenErrorScreen = () => {
  const dispatch = useIODispatch();

  const handleOnClose = useCallback(() => {
    dispatch(zendeskSupportCancel());
  }, [dispatch]);

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

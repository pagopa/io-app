import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../store/hooks";
import { zendeskSupportCancel } from "../store/actions";

const RequestZandeskTokenErrorScreen = () => {
  const dispatch = useIODispatch();

  const handleOnClose = useCallback(() => {
    dispatch(zendeskSupportCancel());
  }, [dispatch]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleOnClose
      }}
      pictogram="umbrella"
      subtitle={I18n.t("support.errorGetZendeskToken.subtitle")}
      title={I18n.t("support.errorGetZendeskToken.title")}
    />
  );
};

export default RequestZandeskTokenErrorScreen;

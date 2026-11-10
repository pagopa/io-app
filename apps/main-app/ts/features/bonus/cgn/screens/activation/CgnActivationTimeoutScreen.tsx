import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../../store/hooks";
import { cgnActivationCancel } from "../../store/actions/activation";

/**
 * Screen which is displayed when a user requested a CGN activation and it took
 * too long to get an answer from the server (the user will be notified when the
 * activation is completed by a message)
 */
const CgnActivationTimeoutScreen = () => {
  const dispatch = useIODispatch();
  const onExit = useCallback(() => dispatch(cgnActivationCancel()), [dispatch]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: onExit
      }}
      pictogram="pending"
      subtitle={I18n.t("bonus.cgn.activation.pending.body")}
      title={I18n.t("bonus.cgn.activation.pending.title")}
    />
  );
};

export default CgnActivationTimeoutScreen;

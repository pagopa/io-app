import * as React from "react";
import { cgnActivationCancel } from "../../store/actions/activation";
import I18n from "../../../../../i18n";
import { useIODispatch } from "../../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

/**
 * Screen which is displayed when a user requested a CGN activation
 * and it took too long to get an answer from the server
 * (the user will be notified when the activation is completed by a message)
 */
const CgnActivationTimeoutScreen = () => {
  const dispatch = useIODispatch();
  const onExit = React.useCallback(
    () => dispatch(cgnActivationCancel()),
    [dispatch]
  );

  return (
    <OperationResultScreenContent
      pictogram="pending"
      title={I18n.t("bonus.cgn.activation.timeout.title")}
      subtitle={I18n.t("bonus.cgn.activation.timeout.body")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: onExit
      }}
    />
  );
};

export default CgnActivationTimeoutScreen;

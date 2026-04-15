import { useCallback } from "react";
import I18n from "i18next";
import { cgnActivationCancel } from "../../store/actions/activation";
import { useIODispatch } from "../../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

/**
 * Screen which is displayed when a user requested a CGN activation
 * and the server has already another request pending for the user
 */
const CgnActivationPendingScreen = () => {
  const dispatch = useIODispatch();
  const onExit = useCallback(() => dispatch(cgnActivationCancel()), [dispatch]);

  return (
    <OperationResultScreenContent
      pictogram="pending"
      title={I18n.t("bonus.cgn.activation.pending.title")}
      subtitle={I18n.t("bonus.cgn.activation.pending.body")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: onExit
      }}
    />
  );
};

export default CgnActivationPendingScreen;

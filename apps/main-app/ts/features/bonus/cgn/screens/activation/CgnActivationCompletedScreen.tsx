import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../../store/hooks";
import { cgnActivationComplete } from "../../store/actions/activation";

/**
 * Screen which is displayed when a user requested a CGN activation
 * and it has been correctly activated
 */
const CgnActivationCompletedScreen = () => {
  const dispatch = useIODispatch();
  const onConfirm = useCallback(() => {
    dispatch(cgnActivationComplete());
  }, [dispatch]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("bonus.cgn.cta.goToDetail"),
        accessibilityLabel: I18n.t("bonus.cgn.cta.goToDetail"),
        testID: "cgnConfirmButtonTestId",
        onPress: onConfirm
      }}
      pictogram="success"
      subtitle={I18n.t("bonus.cgn.activation.success.body")}
      title={I18n.t("bonus.cgn.activation.success.title")}
    />
  );
};

export default CgnActivationCompletedScreen;

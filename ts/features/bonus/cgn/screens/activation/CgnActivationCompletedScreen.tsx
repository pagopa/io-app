import { useCallback } from "react";
import I18n from "i18next";
import { cgnActivationComplete } from "../../store/actions/activation";
import { useIODispatch } from "../../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

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
      pictogram="success"
      title={I18n.t("bonus.cgn.activation.success.title")}
      subtitle={I18n.t("bonus.cgn.activation.success.body")}
      action={{
        label: I18n.t("bonus.cgn.cta.goToDetail"),
        accessibilityLabel: I18n.t("bonus.cgn.cta.goToDetail"),
        testID: "cgnConfirmButtonTestId",
        onPress: onConfirm
      }}
    />
  );
};

export default CgnActivationCompletedScreen;

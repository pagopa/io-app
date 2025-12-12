import { useCallback } from "react";
import I18n from "i18next";
import { cgnActivationCancel } from "../../store/actions/activation";
import { useIODispatch } from "../../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

/**
 * Screen which is displayed when a user requested a CGN activation
 * but is not eligible for its activation
 */
const CgnActivationIneligibleScreen = () => {
  const dispatch = useIODispatch();
  const onExit = useCallback(() => dispatch(cgnActivationCancel()), [dispatch]);
  return (
    <OperationResultScreenContent
      pictogram="accessDenied"
      title={I18n.t("bonus.cgn.activation.ineligible.title")}
      subtitle={I18n.t("bonus.cgn.activation.ineligible.body")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: onExit
      }}
      enableAnimatedPictogram
      loop={false}
    />
  );
};

export default CgnActivationIneligibleScreen;

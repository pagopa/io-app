import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../../store/hooks";
import { cgnActivationCancel } from "../../store/actions/activation";

/**
 * Screen which is displayed when a user requested a CGN activation but is not
 * eligible for its activation
 */
const CgnActivationIneligibleScreen = () => {
  const dispatch = useIODispatch();
  const onExit = useCallback(() => dispatch(cgnActivationCancel()), [dispatch]);
  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: onExit
      }}
      pictogram="accessDenied"
      subtitle={I18n.t("bonus.cgn.activation.ineligible.body")}
      title={I18n.t("bonus.cgn.activation.ineligible.title")}
    />
  );
};

export default CgnActivationIneligibleScreen;

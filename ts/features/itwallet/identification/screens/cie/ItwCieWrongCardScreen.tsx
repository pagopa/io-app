/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "../../../../../i18n";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";

export const ItwCieWrongCardScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwPreventNavigationEvent();

  const handleRetry = useCallback(() => {
    machineRef.send({ type: "back" });
  }, [machineRef]);

  const handleClose = useCallback(() => {
    machineRef.send({ type: "close" });
  }, [machineRef]);

  const action = {
    label: I18n.t("global.buttons.retry"),
    onPress: handleRetry
  };

  const secondaryAction = {
    label: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  return (
    <OperationResultScreenContent
      pictogram="cardQuestion"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.unknownCardContent")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

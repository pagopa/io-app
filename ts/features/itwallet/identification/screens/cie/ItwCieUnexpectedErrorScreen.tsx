/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "../../../../../i18n";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackItWalletCieCardReadingFailure } from "../../../analytics";

export const ItwCieUnexpectedErrorScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwPreventNavigationEvent();

  useOnFirstRender(() => trackItWalletCieCardReadingFailure({ reason: "KO" }));

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
      pictogram="umbrellaNew"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

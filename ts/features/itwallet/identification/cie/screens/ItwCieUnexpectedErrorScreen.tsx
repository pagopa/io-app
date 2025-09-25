/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackItWalletCieCardReadingFailure } from "../../../analytics";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { ItwCieMachineContext } from "../machine/provider";
import { selectReadProgress } from "../machine/selectors";

export const ItwCieUnexpectedErrorScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3Enabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  useItwPreventNavigationEvent();

  useOnFirstRender(() =>
    trackItWalletCieCardReadingFailure({
      reason: "KO",
      itw_flow: isL3Enabled ? "L3" : "L2",
      cie_reading_progress: readProgress ?? 0
    })
  );

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
      pictogram="umbrella"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.card.error.genericErrorSubtitle")}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

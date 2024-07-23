import React from "react";
import I18n from "../../../../../i18n";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";

export const ItwCieExpiredOrInvalidScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwPreventNavigationEvent();

  const handleClose = React.useCallback(() => {
    machineRef.send({ type: "close" });
  }, [machineRef]);

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("authentication.landing.expiredCardTitle")}
      subtitle={I18n.t("authentication.landing.expiredCardContent")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};

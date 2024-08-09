import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

export const ItwIssuanceEidResultScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleContinue = () => {
    machineRef.send({ type: "add-new-credential" });
  };

  const handleClose = () => {
    machineRef.send({ type: "go-to-wallet" });
  };

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.eidResult.success.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.actions.continue"
        ),
        onPress: handleContinue
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.actions.close"
        ),
        onPress: handleClose
      }}
    />
  );
};

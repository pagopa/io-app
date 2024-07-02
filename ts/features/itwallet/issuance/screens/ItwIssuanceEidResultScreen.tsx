import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceEidResultScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleContinue = () => {
    machineRef.send({ type: "add-new-credential" });
  };

  const handleClose = () => {
    machineRef.send({ type: "go-to-wallet" });
  };

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.success.subtitle", {
        credentialName: "{Credential.name}"
      })}
      action={{
        label: I18n.t("global.buttons.continue"),
        onPress: handleContinue
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};

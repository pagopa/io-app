import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";

export const ItwIssuanceEidResultScreen = () => {
  const dismissalDialog = useItwDismissalDialog();

  const handleContinue = () => {
    // TODO continue through the credential issuing
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
        onPress: dismissalDialog.show
      }}
    />
  );
};

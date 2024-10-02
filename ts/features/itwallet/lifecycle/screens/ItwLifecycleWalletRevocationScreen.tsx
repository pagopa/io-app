import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";

export const ItwLifecycleWalletRevocationScreen = () => (
  <OperationResultScreenContent
    pictogram="attention"
    title={I18n.t("features.itWallet.walletRevocation.confirmScreen.title")}
    subtitle={I18n.t(
      "features.itWallet.walletRevocation.confirmScreen.subtitle"
    )}
    action={{
      label: I18n.t("features.itWallet.walletRevocation.confirmScreen.action"),
      accessibilityLabel: I18n.t(
        "features.itWallet.walletRevocation.confirmScreen.action"
      ),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPress: () => {}
    }}
    secondaryAction={{
      label: I18n.t("global.buttons.cancel"),
      accessibilityLabel: I18n.t("global.buttons.cancel"),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPress: () => {}
    }}
  />
);

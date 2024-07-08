import { useIOToast } from "@pagopa/io-app-design-system";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { WalletRoutes } from "../../../newWallet/navigation/routes";

export const ItwIssuanceEidResultScreen = () => {
  const navigation = useIONavigation();
  const toast = useIOToast();

  const handleContinue = () => {
    navigation.replace(WalletRoutes.WALLET_NAVIGATOR, {
      screen: WalletRoutes.WALLET_CARD_ONBOARDING
    });
  };

  const handleClose = () => {
    toast.success(I18n.t("features.itWallet.issuance.eidResult.success.toast"));
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
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

import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  ItwL3UpgradeTrigger,
  trackItwUpgradeL3Mandatory
} from "../../analytics";

export const ItwIssuanceInactiveITWalletScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: ""
  });

  useOnFirstRender(() => {
    trackItwUpgradeL3Mandatory(ItwL3UpgradeTrigger.ADD_CREDENTIAL);
  });

  return (
    <OperationResultScreenContent
      pictogram="identityRefresh"
      title={I18n.t("features.itWallet.issuance.invalidWallet.title")}
      subtitle={I18n.t("features.itWallet.issuance.invalidWallet.subtitle")}
      action={{
        label: I18n.t("features.itWallet.issuance.invalidWallet.primaryAction"),
        onPress: () =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.DISCOVERY.INFO,
            params: {}
          })
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.issuance.invalidWallet.secondaryAction"
        ),
        onPress: navigation.goBack
      }}
    />
  );
};

import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes.ts";

export const ItwIssuanceInactiveITWalletScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <OperationResultScreenContent
      pictogram="workInProgress"
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

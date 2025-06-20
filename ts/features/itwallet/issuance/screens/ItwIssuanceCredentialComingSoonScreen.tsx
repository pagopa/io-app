import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const ItwIssuanceCredentialComingSoonScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: ""
  });
  return (
    <OperationResultScreenContent
      pictogram="workInProgress"
      title={I18n.t("features.itWallet.issuance.credentialComingSoon.title")}
      subtitle={I18n.t(
        "features.itWallet.issuance.credentialComingSoon.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.credentialComingSoon.primaryAction"
        ),
        onPress: navigation.goBack
      }}
    />
  );
};

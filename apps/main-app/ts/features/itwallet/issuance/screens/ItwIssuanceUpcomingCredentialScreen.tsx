import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const ItwIssuanceUpcomingCredentialScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t(
          "features.itWallet.issuance.upcomingCredential.primaryAction"
        ),
        onPress: navigation.goBack
      }}
      pictogram="workInProgress"
      subtitle={I18n.t(
        "features.itWallet.issuance.upcomingCredential.subtitle"
      )}
      title={I18n.t("features.itWallet.issuance.upcomingCredential.title")}
    />
  );
};

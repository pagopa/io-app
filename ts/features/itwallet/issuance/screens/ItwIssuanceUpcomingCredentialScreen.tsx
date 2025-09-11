import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  ItwL3UpgradeTrigger,
  trackItwUpgradeL3Mandatory
} from "../../analytics";

export const ItwIssuanceUpcomingCredentialScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: ""
  });

  useOnFirstRender(() => {
    trackItwUpgradeL3Mandatory(ItwL3UpgradeTrigger.ADD_CREDENTIAL);
  });

  return (
    <OperationResultScreenContent
      pictogram="workInProgress"
      title={I18n.t("features.itWallet.issuance.upcomingCredential.title")}
      subtitle={I18n.t(
        "features.itWallet.issuance.upcomingCredential.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.upcomingCredential.primaryAction"
        ),
        onPress: navigation.goBack
      }}
    />
  );
};

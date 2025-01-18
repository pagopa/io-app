import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

/**
 * Error view component which currently displays a generic error.
 */
export const ItwGenericErrorContent = () => {
  const navigation = useIONavigation();
  return (
    <OperationResultScreenContent
      pictogram="fatalError"
      title={I18n.t("features.itWallet.generic.error.title")}
      subtitle={I18n.t("features.itWallet.generic.error.body")}
      action={{
        accessibilityLabel: I18n.t("global.buttons.back"),
        label: I18n.t("global.buttons.back"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};

import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export type InstitutionServicesFailureProps = {
  onRetry: () => void;
};

export const InstitutionServicesFailure = ({
  onRetry
}: InstitutionServicesFailureProps) => {
  const navigation = useIONavigation();

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      testID="service-institution-failure"
      pictogram="umbrella"
      title={I18n.t("services.institution.failure.title")}
      subtitle={I18n.t("services.institution.failure.subtitle")}
      action={{
        label: I18n.t("services.institution.failure.back"),
        accessibilityLabel: I18n.t("services.institution.failure.back"),
        onPress: () => navigation.goBack()
      }}
      secondaryAction={{
        label: I18n.t("services.institution.failure.retry"),
        accessibilityLabel: I18n.t("services.institution.failure.retry"),
        onPress: onRetry
      }}
    />
  );
};

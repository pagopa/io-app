import React, { useLayoutEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { trackServicesOrganizationDetailError } from "../analytics";

export type InstitutionServicesFailureProps = {
  onRetry: () => void;
};

export const InstitutionServicesFailure = ({
  onRetry
}: InstitutionServicesFailureProps) => {
  const navigation = useIONavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  const handleBack = () => navigation.goBack();

  trackServicesOrganizationDetailError();

  return (
    <OperationResultScreenContent
      testID="service-institution-failure"
      pictogram="umbrellaNew"
      title={I18n.t("services.institution.failure.title")}
      subtitle={I18n.t("services.institution.failure.subtitle")}
      action={{
        label: I18n.t("services.institution.failure.back"),
        accessibilityLabel: I18n.t("services.institution.failure.back"),
        onPress: handleBack
      }}
      secondaryAction={{
        label: I18n.t("services.institution.failure.retry"),
        accessibilityLabel: I18n.t("services.institution.failure.retry"),
        onPress: onRetry
      }}
    />
  );
};

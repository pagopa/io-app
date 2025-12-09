import { useCallback, useLayoutEffect } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { loadServiceDetail } from "../store/actions/details";

export type ServiceDetailsFailureProps = {
  serviceId: string;
};

export const ServiceDetailsFailure = ({
  serviceId
}: ServiceDetailsFailureProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  const handleBack = () => navigation.goBack();

  const handleRetry = useCallback(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="umbrella"
      title={I18n.t("services.details.failure.title")}
      subtitle={I18n.t("services.details.failure.subtitle")}
      action={{
        label: I18n.t("services.details.failure.back"),
        accessibilityLabel: I18n.t("services.details.failure.back"),
        onPress: handleBack,
        testID: "service-details-failure-back"
      }}
      secondaryAction={{
        label: I18n.t("services.details.failure.retry"),
        accessibilityLabel: I18n.t("services.details.failure.retry"),
        onPress: handleRetry,
        testID: "service-details-failure-retry"
      }}
    />
  );
};

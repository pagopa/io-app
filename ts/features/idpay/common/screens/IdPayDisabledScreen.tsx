import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

/**
 * Screen displayed when the IDPay feature is disabled via feature flag.
 * This screen shows a message to the user informing them that the functionality
 * is no longer available.
 */
export const IdPayDisabledScreen = () => {
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    // TODO: Add analytics tracking (https://pagopa.atlassian.net/browse/IOBP-2136)
    // trackIDPayFeatureDisabledScreen();
  });

  useHeaderSecondLevel({
    headerShown: false,
    title: ""
  });

  const handleOnPressClose = () => {
    navigation.popToTop();
  };

  return (
    <OperationResultScreenContent
      testID="idpay-feature-disabled-screen"
      pictogram="umbrella"
      title={I18n.t("idpay.onboarding.featureDisabled.title")}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: handleOnPressClose
      }}
    />
  );
};

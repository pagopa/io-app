import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackIDPayFeatureDisabledScreen } from "../analytics";

/**
 * Screen displayed when the IDPay feature is disabled via feature flag. This
 * screen shows a message to the user informing them that the functionality is
 * no longer available.
 */
export const IdPayDisabledScreen = () => {
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackIDPayFeatureDisabledScreen();
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
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: handleOnPressClose
      }}
      pictogram="umbrella"
      testID="idpay-feature-disabled-screen"
      title={I18n.t("idpay.onboarding.featureDisabled.title")}
    />
  );
};

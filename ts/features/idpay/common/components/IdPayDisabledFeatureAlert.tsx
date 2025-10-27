import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { trackIDPayDisabledFeatureIngressScreen } from "../analytics";
import { IdPayFeatureKey } from "./IdPayEnabledFeatureFlagGuard";

type Props = {
  featureKey: IdPayFeatureKey;
};

export const IdPayDisabledFeatureAlert = ({ featureKey }: Props) => {
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackIDPayDisabledFeatureIngressScreen({ featureKey });
  });

  useHeaderSecondLevel({
    headerShown: false,
    title: ""
  });

  const handleOnPressBack = () => {
    navigation.popToTop();
  };

  return (
    <OperationResultScreenContent
      testID="device-blocking-screen-id"
      pictogram="spinner"
      enableAnimatedPictogram
      title={I18n.t("idpay.onboarding.disabledScreen.title")}
      subtitle={I18n.t("idpay.onboarding.disabledScreen.subtitle")}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: handleOnPressBack
      }}
    />
  );
};

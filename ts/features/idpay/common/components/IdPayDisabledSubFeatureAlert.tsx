import I18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackIDPayDisabledFeatureIngressScreen } from "../analytics";
import { IdPayFeatureKey } from "./IdPayEnabledFeatureFlagGuard";

type Props = {
  featureKey: IdPayFeatureKey;
};

export const IdPayDisabledSubFeatureAlert = ({ featureKey }: Props) => {
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
    <LoadingScreenContent
      testID="device-blocking-screen-id"
      title={I18n.t("idpay.onboarding.disabledScreen.title")}
      subtitle={I18n.t("idpay.onboarding.disabledScreen.subtitle")}
      action={{
        label: I18n.t("global.buttons.cancel"),
        onPress: handleOnPressBack
      }}
    />
  );
};

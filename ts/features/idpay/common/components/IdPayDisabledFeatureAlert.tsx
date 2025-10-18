import I18n from "i18next";
import { useEffect, useState } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import {
  trackIDPayDisabledFeatureError,
  trackIDPayDisabledFeatureIngressScreen
} from "../analytics";
import { IdPayFeatureKey } from "./IdPayEnabledFeatureFlagGuard";

type Props = {
  featureKey: IdPayFeatureKey;
};

export const TIMEOUT_CHANGE_LABEL = 30000;

const timeoutTentativesConfig = [
  {
    contentTitle: I18n.t("idpay.onboarding.failToRetry.contentTitle"),
    timeout: TIMEOUT_CHANGE_LABEL
  },
  {
    contentTitle: I18n.t("startup.title2"),
    timeout: TIMEOUT_CHANGE_LABEL
  }
];

export const IdPayDisabledFeatureAlert = ({ featureKey }: Props) => {
  const navigation = useIONavigation();
  const [contentTitle, setContentTitle] = useState(
    I18n.t("idpay.onboarding.failToRetry.contentTitle")
  );
  const [currentTentative, setCurrentTentative] = useState(0);

  useOnFirstRender(() => {
    trackIDPayDisabledFeatureIngressScreen({ featureKey });
  });

  useHeaderSecondLevel({
    headerShown: false,
    title: ""
  });

  useEffect(() => {
    const tentativeConfig = timeoutTentativesConfig[currentTentative];
    if (!tentativeConfig) {
      return;
    }
    setContentTitle(tentativeConfig?.contentTitle);
    const timeout = setTimeout(() => {
      setCurrentTentative(prev => prev + 1);
    }, tentativeConfig?.timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentTentative]);

  const showBlockingScreen =
    currentTentative === timeoutTentativesConfig.length;

  const handleOnPressBack = () => {
    navigation.popToTop();
  };

  useEffect(() => {
    if (showBlockingScreen) {
      trackIDPayDisabledFeatureError({
        featureKey
      });
    }
  }, [showBlockingScreen, featureKey]);

  if (showBlockingScreen) {
    return (
      <OperationResultScreenContent
        testID="device-blocking-screen-id"
        pictogram="time"
        title={I18n.t("idpay.slowdowns_results_screen.title")}
        subtitle={I18n.t("idpay.slowdowns_results_screen.subtitle")}
        action={{
          label: I18n.t("global.buttons.back"),
          onPress: handleOnPressBack
        }}
      />
    );
  }

  return (
    <LoadingScreenContent
      testID="ingress-screen-loader-id"
      contentTitle={contentTitle}
      animatedPictogramSource="waiting"
    />
  );
};

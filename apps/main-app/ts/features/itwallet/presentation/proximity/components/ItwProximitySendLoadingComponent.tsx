import { HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

type LoadingStep = 0 | 1 | 2;

export const ItwProximitySendLoadingComponent = () => {
  const navigation = useIONavigation();
  const [step, setStep] = useState<LoadingStep>(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <HeaderSecondLevel title={""} type="base" />
    });
  }, [navigation]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 5000),
      setTimeout(() => setStep(2), 10000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const copy = useMemo(() => {
    switch (step) {
      case 0:
        return {
          subtitle: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.0.subtitle"
          ),
          title: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.0.title"
          )
        };
      case 1:
        return {
          subtitle: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.1.subtitle"
          ),
          title: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.1.title"
          )
        };
      case 2:
        return {
          subtitle: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.2.subtitle"
          ),
          title: I18n.t(
            "features.itWallet.presentation.proximity.sendDocumentsLoading.2.title"
          )
        };
    }
  }, [step]);

  return (
    <LoadingScreenContent
      subtitle={copy.subtitle}
      testID="loader"
      title={copy.title}
    />
  );
};

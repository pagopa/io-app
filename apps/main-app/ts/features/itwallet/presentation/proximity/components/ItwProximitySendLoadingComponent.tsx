import { HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect, useState } from "react";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export const ItwProximitySendLoadingComponent = () => {
  const navigation = useIONavigation();
  const [step, setStep] = useState<0 | 1 | 2>(0);

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

  return (
    <LoadingScreenContent
      subtitle={I18n.t(
        `features.itWallet.presentation.proximity.sendDocumentsLoading.${step}.subtitle`
      )}
      testID="loader"
      title={I18n.t(
        `features.itWallet.presentation.proximity.sendDocumentsLoading.${step}.title`
      )}
    />
  );
};

import { HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useLayoutEffect } from "react";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export const ItwProximityConnectionLoadingComponent = () => {
  const navigation = useIONavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <HeaderSecondLevel title={""} type="base" />
    });
  }, [navigation]);

  return (
    <LoadingScreenContent
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.connectionLoading.subtitle"
      )}
      title={I18n.t(
        "features.itWallet.presentation.proximity.connectionLoading.title"
      )}
    />
  );
};

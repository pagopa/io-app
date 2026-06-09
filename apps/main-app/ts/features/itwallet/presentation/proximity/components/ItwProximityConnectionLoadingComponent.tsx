import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
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
      title={I18n.t(
        "features.itWallet.presentation.proximity.connectionLoading.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.connectionLoading.subtitle"
      )}
    />
  );
};

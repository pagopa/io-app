import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderWalletReadyBannerSelector } from "../store/selectors";

export const ItwWalletReadyBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderWalletReadyBannerSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  return (
    <Banner
      testID="itwWalletReadyBannerTestID"
      title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
      content={I18n.t("features.itWallet.issuance.eidResult.success.subtitle")}
      action={I18n.t(
        "features.itWallet.issuance.eidResult.success.actions.continueAlt"
      )}
      pictogramName="itWallet"
      color="turquoise"
      onPress={handleOnPress}
    />
  );
};

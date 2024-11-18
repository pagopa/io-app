import React from "react";
import { Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwCredentialsEidStatusSelector,
  itwIsWalletEmptySelector
} from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

export const ItwWalletReadyBanner = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);

  const navigation = useIONavigation();

  if (!isItwValid || eidStatus === "expired" || !isWalletEmpty) {
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
      size="big"
      onPress={handleOnPress}
    />
  );
};

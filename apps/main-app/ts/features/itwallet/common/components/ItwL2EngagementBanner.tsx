import { Banner } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsWalletEmptySelector } from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwIsActivationDisabledSelector } from "../store/selectors/preferences";

export const ItwL2EngagementBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwIsWalletEmptySelector);

  const isItWalletActivationDisabled = useIOSelector(
    itwIsActivationDisabledSelector
  );

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: isItWalletActivationDisabled
        ? ITW_ROUTES.L3_ONBOARDING
        : ITW_ROUTES.L2_ONBOARDING
    });
  };
  const guardedHandleOnPress = useOfflineToastGuard(handleOnPress);

  if (!shouldRender) {
    return null;
  }
  return (
    <View style={{ marginHorizontal: -8 }}>
      <Banner
        testID="itwWalletL2BannerTestID"
        title={I18n.t("features.itWallet.engagementBanner.l2_banner.title")}
        content={I18n.t(
          "features.itWallet.engagementBanner.l2_banner.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.l2_banner.cta")}
        color="neutral"
        onPress={guardedHandleOnPress}
        pictogramName="cardAdd"
      />
    </View>
  );
};

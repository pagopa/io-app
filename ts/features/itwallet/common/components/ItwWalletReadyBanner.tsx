import { Banner } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwShouldRenderNewItWalletSelector,
  itwShouldRenderWalletReadyBannerSelector
} from "../store/selectors";

export const ItwWalletReadyBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderWalletReadyBannerSelector);
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);

  const bannerTitle = useMemo(
    () =>
      !isNewItwRenderable
        ? I18n.t("features.itWallet.issuance.eidResult.successL2.title")
        : undefined,
    [isNewItwRenderable]
  );

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  return (
    <View style={{ marginHorizontal: -8 }}>
      <Banner
        title={bannerTitle}
        content={I18n.t(
          isNewItwRenderable
            ? "features.itWallet.issuance.emptyWallet.itwReadyBanner.content"
            : "features.itWallet.issuance.eidResult.successL2.subtitle"
        )}
        action={I18n.t(
          "features.itWallet.issuance.eidResult.successL2.actions.continueAlt"
        )}
        color="turquoise"
        onPress={handleOnPress}
        testID="itwWalletReadyBannerTestID"
        pictogramName="itWallet"
      />
    </View>
  );
};

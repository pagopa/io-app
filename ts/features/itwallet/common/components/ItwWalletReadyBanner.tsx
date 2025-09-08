import { Banner } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
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
        title={
          isNewItwRenderable
            ? undefined
            : I18n.t(
                "features.itWallet.issuance.emptyWallet.readyBannerL2.title"
              )
        }
        content={I18n.t(
          isNewItwRenderable
            ? "features.itWallet.issuance.emptyWallet.readyBanner.content"
            : "features.itWallet.issuance.emptyWallet.readyBannerL2.content"
        )}
        action={I18n.t(
          "features.itWallet.issuance.emptyWallet.readyBanner.action"
        )}
        color="turquoise"
        onPress={handleOnPress}
        testID="itwWalletReadyBannerTestID"
        pictogramName="itWallet"
      />
    </View>
  );
};

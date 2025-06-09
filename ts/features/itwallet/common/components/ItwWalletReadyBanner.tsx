import { Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwShouldRenderNewITWalletSelector,
  itwShouldRenderWalletReadyBannerSelector
} from "../store/selectors";

export const ItwWalletReadyBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderWalletReadyBannerSelector);
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewITWalletSelector);

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
      {...(isNewItwRenderable
        ? {
            content: I18n.t(
              "features.itWallet.issuance.emptyWallet.itwReadyBanner.content"
            ),
            color: "neutral"
          }
        : {
            title: I18n.t("features.itWallet.issuance.eidResult.success.title"),
            content: I18n.t(
              "features.itWallet.issuance.eidResult.success.subtitle"
            ),
            action: I18n.t(
              "features.itWallet.issuance.eidResult.success.actions.continueAlt"
            ),
            color: "turquoise",
            onPress: handleOnPress
          })}
      testID="itwWalletReadyBannerTestID"
      pictogramName="itWallet"
    />
  );
};

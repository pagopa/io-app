import { Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCloseOfflineBanner } from "../store/actions/preferences.ts";
import { itwShouldRenderOfflineBannerSelector } from "../store/selectors";

export const ItwOfflineWalletBanner = () => {
  const dispatch = useIODispatch();
  const shouldRender = useIOSelector(itwShouldRenderOfflineBannerSelector);

  // Show the banner only if the wallet is valid, offline access is enabled, and the banner is not hidden
  if (!shouldRender) {
    return null;
  }

  const handlePress = () => {
    // TODO: [SIW-2309] Implement action when the FAQ are ready
  };

  const handleOnClose = () => {
    dispatch(itwCloseOfflineBanner());
  };

  return (
    <Banner
      testID="itwOfflineWalletBannerTestID"
      title={I18n.t("features.itWallet.discovery.offlineBanner.title")}
      content={I18n.t("features.itWallet.discovery.offlineBanner.content")}
      action={I18n.t("features.itWallet.discovery.offlineBanner.action")}
      pictogramName="notification"
      color="neutral"
      onPress={handlePress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
    />
  );
};

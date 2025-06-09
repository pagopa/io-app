import { Banner, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { useRoute } from "@react-navigation/native";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwSetOfflineBannerHidden } from "../store/actions/preferences.ts";
import { itwShouldRenderOfflineBannerSelector } from "../store/selectors";
import { openWebUrl } from "../../../../utils/url.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  trackItWalletBannerTap,
  trackITWalletBannerVisualized
} from "../../analytics";

const offlineDocumentsFAQ =
  "https://assistenza.ioapp.it/hc/it/articles/34805335324049-Posso-usare-i-documenti-digitali-senza-connessione";

export const ItwOfflineWalletBanner = () => {
  const dispatch = useIODispatch();
  const shouldRender = useIOSelector(itwShouldRenderOfflineBannerSelector);
  const route = useRoute();

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "itwOfflineBanner",
      banner_page: route.name,
      banner_landing: offlineDocumentsFAQ
    }),
    [route.name]
  );

  useOnFirstRender(
    useCallback(() => {
      if (shouldRender) {
        trackITWalletBannerVisualized(trackBannerProperties);
      }
    }, [trackBannerProperties, shouldRender])
  );

  // Show the banner only if the wallet is valid, offline access is enabled, and the banner is not hidden
  if (!shouldRender) {
    return null;
  }

  const handlePress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    openWebUrl(offlineDocumentsFAQ, () =>
      IOToast.error(I18n.t("genericError"))
    );
  };

  const handleOnClose = () => {
    dispatch(itwSetOfflineBannerHidden(true));
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

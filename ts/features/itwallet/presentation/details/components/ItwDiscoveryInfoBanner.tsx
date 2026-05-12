import { Banner, IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { useIODispatch } from "../../../../../store/hooks";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackItwBannerClosure,
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../analytics";
import { itwCloseBanner } from "../../../common/store/actions/banners";

const WHAT_IS_ITW_WALLET_ID =
  "https://assistenza.ioapp.it/hc/it/articles/31106401885841-Quando-e-come-usare-i-documenti-digitali";

const ItwDiscoveryInfoBanner = () => {
  const dispatch = useIODispatch();

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "itwWalletID",
      banner_page: "ITW_PRESENTATION_PID_DETAIL",
      banner_landing: WHAT_IS_ITW_WALLET_ID
    }),
    []
  );

  useFocusEffect(
    useCallback(() => {
      trackItwBannerVisualized(trackBannerProperties);
    }, [trackBannerProperties])
  );

  const handleOnPress = () => {
    trackItwBannerTap(trackBannerProperties);
    openWebUrl(WHAT_IS_ITW_WALLET_ID, () =>
      IOToast.error(I18n.t("global.jserror.title"))
    );
  };

  const handleOnClose = () => {
    trackItwBannerClosure(trackBannerProperties);
    dispatch(itwCloseBanner("itw_pid_info"));
  };

  return (
    <Banner
      testID="itwDiscoveryInfoBannerTestID"
      color="neutral"
      pictogramName="help"
      title={I18n.t("features.itWallet.presentation.itWalletId.banner.title")}
      content={I18n.t(
        "features.itWallet.presentation.itWalletId.banner.content"
      )}
      action={I18n.t("global.buttons.findOutMore")}
      onPress={handleOnPress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
    />
  );
};

export { ItwDiscoveryInfoBanner };

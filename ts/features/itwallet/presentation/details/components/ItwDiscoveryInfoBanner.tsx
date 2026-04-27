import {
  Banner,
  IOToast,
  IOVisualCostants
} from "@pagopa/io-app-design-system";

import { createRef, useCallback, useMemo } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { itwIsBannerHiddenSelector } from "../../../common/store/selectors/banners.ts";
import { openWebUrl } from "../../../../../utils/url.ts";
import { itwCloseBanner } from "../../../common/store/actions/banners.ts";
import {
  trackItwBannerClosure,
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../analytics/index.ts";

const WHAT_IS_ITW_WALLET_ID =
  "https://assistenza.ioapp.it/hc/it/articles/31106401885841-Quando-e-come-usare-i-documenti-digitali";

const ItwDiscoveryInfoBanner = () => {
  const bannerRef = createRef<View>();
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

  const hiddenItwDiscoveryInfoBanner = useIOSelector(
    itwIsBannerHiddenSelector("itw_discovery_info")
  );

  const handleOnPress = () => {
    trackItwBannerTap(trackBannerProperties);
    openWebUrl(WHAT_IS_ITW_WALLET_ID, () =>
      IOToast.error(I18n.t("global.jserror.title"))
    );
  };

  const handleOnClose = () => {
    trackItwBannerClosure(trackBannerProperties);
    dispatch(itwCloseBanner("itw_discovery_info"));
  };

  if (hiddenItwDiscoveryInfoBanner) {
    return null;
  }

  return (
    <View style={{ paddingVertical: IOVisualCostants.appMarginDefault }}>
      <Banner
        color="neutral"
        pictogramName="help"
        ref={bannerRef}
        title={I18n.t(
          "features.itWallet.presentation.qrCode.banner.whatIsITWalletID"
        )}
        content={I18n.t(
          "features.itWallet.presentation.qrCode.banner.whatIsITWalletIDDEscription"
        )}
        action={I18n.t("global.buttons.findOutMore")}
        onPress={handleOnPress}
        labelClose={I18n.t("global.buttons.close")}
        onClose={handleOnClose}
      />
    </View>
  );
};

export { ItwDiscoveryInfoBanner };

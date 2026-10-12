import { Banner, useIOToast } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { openWebUrl } from "../../../../../utils/url";
import {
  trackItwBannerClosure,
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../analytics";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { itwShowcaseUrlSelector } from "../../../common/store/selectors/remoteConfig.ts";

const ItwDiscoveryInfoBanner = () => {
  const dispatch = useIODispatch();

  const toast = useIOToast();
  const showcaseUrl = useIOSelector(itwShowcaseUrlSelector);

  const trackBannerProperties = useMemo(
    () =>
      showcaseUrl
        ? {
            banner_id: "itwWalletID",
            banner_page: "ITW_PRESENTATION_PID_DETAIL",
            banner_landing: showcaseUrl
          }
        : undefined,
    [showcaseUrl]
  );

  useFocusEffect(
    useCallback(() => {
      if (trackBannerProperties) {
        trackItwBannerVisualized(trackBannerProperties);
      }
    }, [trackBannerProperties])
  );

  const handleOnPress = () => {
    if (!showcaseUrl) {
      toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
      return;
    }
    if (trackBannerProperties) {
      trackItwBannerTap(trackBannerProperties);
    }
    openWebUrl(showcaseUrl, () => {
      toast.error(I18n.t("global.jserror.title"));
    });
  };

  const handleOnClose = () => {
    if (trackBannerProperties) {
      trackItwBannerClosure(trackBannerProperties);
    }
    dispatch(itwCloseBanner("itw_pid_info"));
  };

  return (
    <Banner
      action={I18n.t("global.buttons.findOutMore")}
      color="neutral"
      content={I18n.t(
        "features.itWallet.presentation.itWalletId.banner.content"
      )}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
      onPress={handleOnPress}
      pictogramName="help"
      testID="itwDiscoveryInfoBannerTestID"
      title={I18n.t("features.itWallet.presentation.itWalletId.banner.title")}
    />
  );
};

export { ItwDiscoveryInfoBanner };

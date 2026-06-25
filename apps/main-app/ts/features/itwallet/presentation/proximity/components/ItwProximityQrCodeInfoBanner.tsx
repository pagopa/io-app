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

const HOW_AND_WHEN_TO_USE_IO_DOCUMENTS =
  "https://assistenza.ioapp.it/hc/it/articles/31106401885841-Quando-e-come-usare-i-documenti-digitali";

const ItwProximityQrCodeInfoBanner = () => {
  const dispatch = useIODispatch();

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "itwQrCodeInfos",
      banner_page: "ITW_QR_CODE",
      banner_landing: HOW_AND_WHEN_TO_USE_IO_DOCUMENTS
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
    openWebUrl(HOW_AND_WHEN_TO_USE_IO_DOCUMENTS, () =>
      IOToast.error(I18n.t("global.jserror.title"))
    );
  };

  const handleOnClose = () => {
    trackItwBannerClosure(trackBannerProperties);
    dispatch(itwCloseBanner("proximity_qr_code_info"));
  };

  return (
    <Banner
      action={I18n.t(
        "features.itWallet.presentation.proximity.engagement.banner.action"
      )}
      color="neutral"
      content={I18n.t(
        "features.itWallet.presentation.proximity.engagement.banner.content"
      )}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
      onPress={handleOnPress}
      pictogramName="help"
      title={I18n.t(
        "features.itWallet.presentation.proximity.engagement.banner.title"
      )}
    />
  );
};

export { ItwProximityQrCodeInfoBanner };

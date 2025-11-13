import { Banner } from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import {
  trackITWalletBannerVisualized,
  trackItWalletBannerClosure,
  trackItWalletBannerTap
} from "../../../analytics";
import { ITW_SCREENVIEW_EVENTS } from "../../../analytics/enum";
import { itwSetWalletUpgradeMDLDetailsBannerHidden } from "../../../common/store/actions/preferences";
import { ITW_ROUTES } from "../../../navigation/routes";

/**
 * Banner promoting IT Wallet upgrade in MDL details to enable
 * driving license usage as identity document.
 */
export const ItwPresentationWalletUpgradeMDLDetailsBanner = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { name: routeName } = useRoute();

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "walletUpgradeMDLDetailsBanner",
      banner_page: routeName,
      banner_landing: ITW_SCREENVIEW_EVENTS.ITW_INTRO,
      banner_campaign: I18n.t(
        "features.itWallet.presentation.credentialDetails.mdl.walletUpgradeBanner.title"
      )
    }),
    [routeName]
  );

  useFocusEffect(
    useCallback(() => {
      trackITWalletBannerVisualized(trackBannerProperties);
    }, [trackBannerProperties])
  );

  const handleOnPress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const handleOnClose = () => {
    trackItWalletBannerClosure(trackBannerProperties);
    dispatch(itwSetWalletUpgradeMDLDetailsBannerHidden(true));
  };

  return (
    <Banner
      testID="itwUpgradeMDLDetailsBannerTestID"
      title={I18n.t(
        "features.itWallet.presentation.credentialDetails.mdl.walletUpgradeBanner.title"
      )}
      content={I18n.t(
        "features.itWallet.presentation.credentialDetails.mdl.walletUpgradeBanner.content"
      )}
      action={I18n.t(
        "features.itWallet.presentation.credentialDetails.mdl.walletUpgradeBanner.action"
      )}
      pictogramName="cie"
      color="neutral"
      onPress={handleOnPress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
    />
  );
};

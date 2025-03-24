import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { createRef, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackItWalletBannerClosure,
  trackItWalletBannerTap,
  trackITWalletBannerVisualized
} from "../../../analytics";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { itwCloseDiscoveryBanner } from "../../store/actions/preferences";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../../store/selectors/preferences.ts";

/**
 * to use in flows where we want to handle the banner's visibility logic externally
 *  (see MultiBanner feature for the landing screen)
 */

export type ItwDiscoveryBannerProps = {
  withTitle?: boolean;
  ignoreMargins?: boolean;
  closable?: boolean;
  handleOnClose?: () => void;
};

type BannerType = "onboarding" | "reactivating";

export const ItwDiscoveryBanner = ({
  withTitle = true,
  ignoreMargins = false,
  closable,
  handleOnClose
}: ItwDiscoveryBannerProps) => {
  const bannerRef = createRef<View>();
  const dispatch = useIODispatch();
  const isWalletRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );
  const navigation = useIONavigation();
  const route = useRoute();

  const [bannerState, setBannerState] = useState<{
    shouldRender: boolean;
    type: BannerType | null;
  }>({ shouldRender: false, type: null });

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "itwDiscoveryBannerTestID",
      banner_page: route.name,
      banner_landing: "ITW_INTRO"
    }),
    [route.name]
  );
  const handleOnPress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };
  useOnFirstRender(() => {
    trackITWalletBannerVisualized(trackBannerProperties);
  });

  const handleClose = () => {
    trackItWalletBannerClosure(trackBannerProperties);
    handleOnClose?.();
    dispatch(itwCloseDiscoveryBanner());
  };

  // This effect is used to determine which banner to show and if it should be shown
  useEffect(() => {
    const isDataLoaded = pipe(O.fromNullable(isWalletRemotelyActive), O.isSome);
    if (isDataLoaded && !bannerState.shouldRender) {
      const type: BannerType = isWalletRemotelyActive
        ? "reactivating"
        : "onboarding";
      setBannerState({ shouldRender: true, type });
    }
  }, [isWalletRemotelyActive, bannerState.shouldRender]);

  if (!bannerState.shouldRender || !bannerState.type) {
    return null;
  }

  const bannerConfig = {
    onboarding: {
      content: I18n.t("features.itWallet.discovery.banner.home.content"),
      title: I18n.t("features.itWallet.discovery.banner.home.title"),
      action: I18n.t("features.itWallet.discovery.banner.home.action")
    },
    reactivating: {
      content: I18n.t("features.itWallet.discovery.banner.homeActive.content"),
      title: I18n.t("features.itWallet.discovery.banner.homeActive.title"),
      action: I18n.t("features.itWallet.discovery.banner.homeActive.action")
    }
  };

  const { content, title, action } = bannerConfig[bannerState.type];

  return (
    <View style={!ignoreMargins && styles.margins}>
      <Banner
        testID="itwDiscoveryBannerTestID"
        viewRef={bannerRef}
        title={withTitle ? title : undefined}
        content={content}
        action={action}
        pictogramName="itWallet"
        color="turquoise"
        onClose={closable ? handleClose : undefined}
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});

import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { createRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackItWalletBannerClosure,
  trackItWalletBannerTap,
  trackITWalletBannerVisualized
} from "../../../analytics";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useIODispatch } from "../../../../../store/hooks";
import { itwCloseDiscoveryBanner } from "../../store/actions/preferences";
import { useItwDiscoveryBannerType } from "../../hooks/useItwDiscoveryBannerType.ts";

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

export const ItwDiscoveryBanner = ({
  withTitle = true,
  ignoreMargins = false,
  closable,
  handleOnClose
}: ItwDiscoveryBannerProps) => {
  const bannerRef = createRef<View>();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const route = useRoute();
  const bannerType = useItwDiscoveryBannerType();

  const trackBannerProperties = useMemo(
    () => ({
      banner_id:
        bannerType === "onboarding"
          ? "itwDiscoveryBannerTestID"
          : "itwDiscoveryBannerDeviceChanged",
      banner_page: route.name,
      banner_landing: "ITW_INTRO"
    }),
    [bannerType, route.name]
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

  if (!bannerType) {
    return null;
  }

  const { content, title, action } = bannerConfig[bannerType];

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

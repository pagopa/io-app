import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { createRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackItwBannerVisualized,
  trackItwBannerClosure,
  trackItwBannerTap
} from "../../../analytics";
import { ITW_ROUTES } from "../../../navigation/routes";
import { useItwDiscoveryBannerType } from "../../hooks/useItwDiscoveryBannerType";
import { itwCloseBanner } from "../../store/actions/banners";

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
} as const;

export type ItwDiscoveryBannerProps = {
  withTitle?: boolean;
  ignoreMargins?: boolean;
  closable?: boolean;
  handleOnClose?: () => void;
};

/**
 * Discovery banner used in flows where we want to handle the banner's visibility logic externally
 *  (see MultiBanner feature for the landing screen)
 * @deprecated this banners is for the legacy Documenti su IO flow.
 */
export const ItwDiscoveryBannerLegacy = ({
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
        bannerType === "reactivating"
          ? "itwDiscoveryBannerDeviceChanged"
          : "itwDiscoveryBannerTestID",
      banner_page: route.name,
      banner_landing: "ITW_INTRO"
    }),
    [bannerType, route.name]
  );
  const handleOnPress = () => {
    trackItwBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: {}
    });
  };
  useOnFirstRender(() => {
    trackItwBannerVisualized(trackBannerProperties);
  });

  const handleClose = () => {
    trackItwBannerClosure(trackBannerProperties);
    handleOnClose?.();
    dispatch(itwCloseBanner("discovery"));
  };

  if (!bannerType) {
    return null;
  }

  const { content, title, action } = bannerConfig[bannerType];

  return (
    <View style={!ignoreMargins && styles.margins}>
      <Banner
        testID="itwDiscoveryBannerTestID"
        ref={bannerRef}
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

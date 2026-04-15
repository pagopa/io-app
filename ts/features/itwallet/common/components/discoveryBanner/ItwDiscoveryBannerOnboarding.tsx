import { Banner } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { memo, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../analytics";
import { ITW_ROUTES } from "../../../navigation/routes";
import { isItwDiscoveryBannerRenderableSelector } from "../../store/selectors";
import { useItwDiscoveryBannerType } from "../../hooks/useItwDiscoveryBannerType.ts";

const bannerConfig = {
  onboarding: {
    content: I18n.t("features.itWallet.discovery.banner.home.content")
  },
  reactivating: {
    content: I18n.t(
      "features.itWallet.discovery.banner.onboardingActive.content"
    )
  }
} as const;

/**
 * ITW discovery banner to be displayed in the wallet card onboarding screen
 */
const ItwDiscoveryBannerOnboarding = () => {
  const navigation = useIONavigation();
  const route = useRoute();
  const bannerType = useItwDiscoveryBannerType();
  const isBannerRenderable = useIOSelector(
    isItwDiscoveryBannerRenderableSelector
  );

  const trackBannerProperties = useMemo(
    () => ({
      banner_id:
        bannerType === "reactivating"
          ? "itwDiscoveryBannerOnboardingDeviceChanged"
          : "itwDiscoveryBannerOnboardingTestID",
      banner_page: route.name,
      banner_landing: "ITW_ONBOARDING"
    }),
    [bannerType, route.name]
  );

  useOnFirstRender(
    useCallback(() => {
      if (isBannerRenderable) {
        trackItwBannerVisualized(trackBannerProperties);
      }
    }, [trackBannerProperties, isBannerRenderable])
  );

  const handleOnPress = () => {
    trackItwBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: {}
    });
  };

  if (!isBannerRenderable || !bannerType) {
    return null;
  }

  const { content } = bannerConfig[bannerType];

  return (
    <View style={styles.wrapper}>
      <Banner
        testID="itwDiscoveryBannerOnboardingTestID"
        content={content}
        action={I18n.t("features.itWallet.discovery.banner.onboarding.action")}
        pictogramName="itWallet"
        color="neutral"
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16
  }
});

const MemoizedItwDiscoveryBannerOnboarding = memo(ItwDiscoveryBannerOnboarding);

export { MemoizedItwDiscoveryBannerOnboarding as ItwDiscoveryBannerOnboarding };

import { Banner } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { memo, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackItWalletBannerTap,
  trackITWalletBannerVisualized
} from "../../../analytics";
import { ITW_ROUTES } from "../../../navigation/routes";
import { isItwDiscoveryBannerRenderableSelector } from "../../store/selectors";
import { itwIsWalletInstanceRemotelyActiveSelector } from "../../store/selectors/preferences.ts";

/**
 * ITW discovery banner to be displayed in the wallet card onboarding screen
 */
const ItwDiscoveryBannerOnboarding = () => {
  const navigation = useIONavigation();
  const route = useRoute();

  const isBannerRenderable = useIOSelector(
    isItwDiscoveryBannerRenderableSelector
  );

  const isWalletRemotelyActive = useIOSelector(
    itwIsWalletInstanceRemotelyActiveSelector
  );

  const trackBannerProperties = useMemo(
    () => ({
      banner_id: "itwDiscoveryBannerOnboardingTestID",
      banner_page: route.name,
      banner_landing: "ITW_ONBOARDING"
    }),
    [route.name]
  );

  useOnFirstRender(
    useCallback(() => {
      if (isBannerRenderable) {
        trackITWalletBannerVisualized(trackBannerProperties);
      }
    }, [trackBannerProperties, isBannerRenderable])
  );

  const handleOnPress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  const shouldRender = pipe(
    O.fromNullable(isWalletRemotelyActive),
    O.fold(
      () => false,
      () => isBannerRenderable
    )
  );

  const bannerConfig = {
    onboarding: {
      content: I18n.t("features.itWallet.discovery.banner.home.content")
    },
    reactivating: {
      content: I18n.t(
        "features.itWallet.discovery.banner.onboardingActive.content"
      )
    }
  };

  const bannerType = useMemo(
    () => (isWalletRemotelyActive ? "reactivating" : "onboarding"),
    [isWalletRemotelyActive]
  );
  const { content } = bannerConfig[bannerType];

  if (!shouldRender) {
    return null;
  }

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

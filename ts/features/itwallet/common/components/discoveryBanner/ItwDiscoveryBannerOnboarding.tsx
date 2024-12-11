import { Banner } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
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

/**
 * ITW dicovery banner to be displayed in the wallet card onboarding screen
 */
const ItwDiscoveryBannerOnboarding = () => {
  const navigation = useIONavigation();
  const route = useRoute();

  const isBannerRenderable = useIOSelector(
    isItwDiscoveryBannerRenderableSelector
  );

  const trackBannerProperties = React.useMemo(
    () => ({
      banner_id: "itwDiscoveryBannerTestID",
      banner_page: route.name,
      banner_landing: "ITW_INTRO"
    }),
    [route.name]
  );

  useOnFirstRender(
    React.useCallback(() => {
      if (isBannerRenderable) {
        trackITWalletBannerVisualized(trackBannerProperties);
      }
    }, [trackBannerProperties, isBannerRenderable])
  );

  if (!isBannerRenderable) {
    return null;
  }

  const handleOnPress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  return (
    <View style={styles.wrapper}>
      <Banner
        testID="itwDiscoveryBannerTestID"
        content={I18n.t(
          "features.itWallet.discovery.banner.onboarding.content"
        )}
        action={I18n.t("features.itWallet.discovery.banner.onboarding.action")}
        pictogramName="itWallet"
        color="neutral"
        size="big"
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

const MemoizedItwDiscoveryBannerOnboarding = React.memo(
  ItwDiscoveryBannerOnboarding
);

export { MemoizedItwDiscoveryBannerOnboarding as ItwDiscoveryBannerOnboarding };

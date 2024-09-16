import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { isItwTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  trackItWalletBannerTap,
  trackItWalletBannerClosure,
  trackITWalletBannerVisualized
} from "../../analytics";

type ItwDiscoveryBannerProps = {
  withTitle?: boolean;
  ignoreMargins?: boolean;
};

export const ItwDiscoveryBanner = ({
  withTitle = true,
  ignoreMargins = false
}: ItwDiscoveryBannerProps) => {
  const bannerRef = React.createRef<View>();
  const navigation = useIONavigation();
  const [isVisible, setVisible] = React.useState(true);
  const isItwTrialActive = useIOSelector(isItwTrialActiveSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  const shouldBeHidden = React.useMemo(
    () =>
      // Banner should be hidden if:
      !isVisible || // The user closed it by pressing the `x` button
      !isItwTrialActive || // The user is not part of the trial
      isItwValid || // The user already activated the wallet
      !isItwEnabled, // The IT Wallet features is not enabled
    [isVisible, isItwTrialActive, isItwValid, isItwEnabled]
  );

  const trackBannerProperties = React.useMemo(
    () => ({
      banner_id: "itwDiscoveryBannerTestID", // Banner testID prop
      banner_page:
        navigation?.getState()?.routes?.[navigation?.getState()?.index]?.name,
      banner_landing: "ITW_INTRO"
    }),
    [navigation]
  );

  useOnFirstRender(() => {
    if (!shouldBeHidden) {
      trackITWalletBannerVisualized(trackBannerProperties);
    }
  });

  if (shouldBeHidden) {
    return null;
  }

  const handleOnPress = () => {
    trackItWalletBannerTap(trackBannerProperties);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  const handleOnClose = () => {
    trackItWalletBannerClosure(trackBannerProperties);
    setVisible(false);
  };

  return (
    <View style={!ignoreMargins && styles.margins}>
      <Banner
        testID="itwDiscoveryBannerTestID"
        viewRef={bannerRef}
        title={
          withTitle
            ? I18n.t("features.itWallet.discovery.banner.title")
            : undefined
        }
        content={I18n.t("features.itWallet.discovery.banner.content")}
        action={I18n.t("features.itWallet.discovery.banner.action")}
        pictogramName="itWallet"
        color="turquoise"
        size="big"
        onClose={handleOnClose}
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

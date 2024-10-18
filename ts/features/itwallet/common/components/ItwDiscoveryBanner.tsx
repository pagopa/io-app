import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import React, { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { isItwTrialActiveSelector } from "../../../trialSystem/store/reducers";
import {
  trackItWalletBannerClosure,
  trackItWalletBannerTap,
  trackITWalletBannerVisualized
} from "../../analytics";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

// the two components are divided in order to
// use the `standalone` version in flows where its visibility logic it not handled,
// and the base version in flows where it instead is handled externally

type ItwDiscoveryBannerProps = {
  withTitle?: boolean;
  ignoreMargins?: boolean;
  fallbackComponent?: ReactElement;
  closable?: boolean;
};

/**
 * to use in flows where either
 * - we need a fallback component
 * - we do not want to handle the banner's visibility logic externally
 */
export const ItwDiscoveryBannerStandalone = (
  props: ItwDiscoveryBannerProps
) => {
  const [isVisible, setVisible] = React.useState(true);

  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  const isItwTrialActive = useIOSelector(isItwTrialActiveSelector);
  const shouldBeHidden = React.useMemo(
    () =>
      // Banner should be hidden if:
      !isVisible || // The user closed it by pressing the `x` button
      !isItwTrialActive || // The user is not part of the trial
      isItwValid || // The user already activated the wallet
      !isItwEnabled, // The IT Wallet features is not enabled
    [isVisible, isItwTrialActive, isItwValid, isItwEnabled]
  );
  // end logic
  const { fallbackComponent } = props;
  if (shouldBeHidden) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return null;
  }

  return (
    <ItwDiscoveryBanner handleOnClose={() => setVisible(false)} {...props} />
  );
};

type WrapperlessBannerProps = {
  withTitle?: boolean;
  ignoreMargins?: boolean;
  closable?: boolean;
  handleOnClose?: () => void;
};
/**
 * to use in case the banner's visibility has to be handled externally
 * (see MultiBanner feature for the landing screen)
 */
export const ItwDiscoveryBanner = ({
  withTitle = true,
  ignoreMargins = false,
  closable,
  handleOnClose
}: WrapperlessBannerProps) => {
  const bannerRef = React.createRef<View>();

  const navigation = useIONavigation();
  const route = useRoute();

  const trackBannerProperties = React.useMemo(
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
  };
  // trailID

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

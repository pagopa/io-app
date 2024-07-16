import {
  Banner,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { isTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { ITW_ROUTES } from "../../navigation/routes";
import { ITW_TRIAL_ID } from "../utils/itwTrialUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

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
  const isTrialActive = useIOSelector(isTrialActiveSelector(ITW_TRIAL_ID));
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  /**
   * Banner shold be hidden if:
   * - The user closed it by pressing the `x`
   * - The user is not part of the trial
   * - The user already activated the wallet
   */
  if (!isVisible || !isTrialActive || isItwValid) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  return (
    <View
      style={
        !ignoreMargins
          ? { marginHorizontal: IOVisualCostants.appMarginDefault }
          : {}
      }
    >
      <VSpacer size={16} />
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
        onClose={() => setVisible(false)}
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
      />
      <VSpacer size={16} />
    </View>
  );
};

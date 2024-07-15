import {
  Banner,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";
import { ITW_ROUTES } from "../../navigation/routes";
import { ITW_TRIAL_ID } from "../utils/itwTrialUtils";

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
  const trialStatus = useIOSelector(trialStatusSelector(ITW_TRIAL_ID));
  // TODO If ITW already active do not show banner

  if (!isVisible || trialStatus !== SubscriptionStateEnum.SUBSCRIBED) {
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

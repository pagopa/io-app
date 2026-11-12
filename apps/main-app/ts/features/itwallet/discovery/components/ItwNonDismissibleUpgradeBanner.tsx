import { Banner } from "@io-app/design-system";
import I18n from "i18next";
import { StyleProp, View, ViewStyle } from "react-native";

import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const ItwNonDismissibleUpgradeBanner = ({ style }: Props) => {
  const navigation = useIONavigation();

  const navigateToDiscoveryScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const guardedNavigateToDiscoveryScreen = useOfflineToastGuard(
    navigateToDiscoveryScreen
  );

  return (
    <View style={style}>
      <Banner
        action={I18n.t(
          "features.itWallet.engagementBanner.upgrade_from_expired.action"
        )}
        color="neutral"
        content={I18n.t(
          "features.itWallet.engagementBanner.upgrade_from_expired.description"
        )}
        onPress={guardedNavigateToDiscoveryScreen}
        pictogramName="premiumCredentials"
        testID="itwNonDismissibleUpgradeBannerTestID"
        title={I18n.t(
          "features.itWallet.engagementBanner.upgrade_from_expired.title"
        )}
      />
    </View>
  );
};

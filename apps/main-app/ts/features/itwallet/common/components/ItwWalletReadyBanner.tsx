import { Banner } from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwShouldRenderNewItWalletSelector,
  itwShouldRenderWalletReadyBannerSelector
} from "../store/selectors";

export const ItwWalletReadyBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderWalletReadyBannerSelector);
  const isItWallet = useIOSelector(itwShouldRenderNewItWalletSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  return (
    <View style={isItWallet ? styles.containerItw : styles.container}>
      <Banner
        action={I18n.t(
          "features.itWallet.issuance.emptyWallet.readyBanner.action"
        )}
        color="turquoise"
        content={I18n.t(
          isItWallet
            ? "features.itWallet.issuance.emptyWallet.readyBanner.content"
            : "features.itWallet.issuance.emptyWallet.readyBannerL2.content"
        )}
        onPress={handleOnPress}
        pictogramName="itWallet"
        testID="itwWalletReadyBannerTestID"
        title={I18n.t(
          isItWallet
            ? "features.itWallet.issuance.emptyWallet.readyBanner.title"
            : "features.itWallet.issuance.emptyWallet.readyBannerL2.title"
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 0
  },
  containerItw: {
    marginHorizontal: 0,
    marginTop: 16
  }
});

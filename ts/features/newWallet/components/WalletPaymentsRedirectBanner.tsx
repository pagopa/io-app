import {
  Banner,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isWalletPaymentsRedirectBannerVisibleSelector } from "../store/selectors";
import { walletSetPaymentsRedirectBannerVisible } from "../store/actions/preferences";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";

const WalletPaymentsRedirectBanner = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const bannerRef = React.createRef<View>();

  const isVisible = useIOSelector(
    isWalletPaymentsRedirectBannerVisibleSelector
  );

  const handleOnBannerPress = () => {
    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.PAYMENTS_HOME
    });
  };

  const handleOnBannerClose = () => {
    dispatch(walletSetPaymentsRedirectBannerVisible(false));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Banner
        title={I18n.t("features.wallet.home.paymentsBanner.title")}
        action={I18n.t("features.wallet.home.paymentsBanner.action")}
        labelClose={I18n.t("features.wallet.home.paymentsBanner.close")}
        color="neutral"
        pictogramName="payments"
        size="small"
        viewRef={bannerRef}
        onPress={handleOnBannerPress}
        onClose={handleOnBannerClose}
      />
      <VSpacer size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export { WalletPaymentsRedirectBanner };

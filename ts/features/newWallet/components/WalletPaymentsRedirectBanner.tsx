import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { walletSetPaymentsRedirectBannerVisible } from "../store/actions/preferences";
import { isWalletPaymentsRedirectBannerVisibleSelector } from "../store/selectors";

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
    <>
      <Banner
        testID="walletPaymentsRedirectBannerTestID"
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
    </>
  );
};

export { WalletPaymentsRedirectBanner };

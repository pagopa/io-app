import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";

const WalletPaymentsRedirectBanner = () => {
  const bannerRef = React.createRef<View>();
  const [isVisible, setVisible] = React.useState(true);

  const handleOnBannerPress = () => {
    // TODO add payments section navigation
  };

  const handleOnBannerClose = () => {
    setVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
      <Banner
        title={I18n.t("features.wallet.home.paymentsBanner.title")}
        action={I18n.t("features.wallet.home.paymentsBanner.action")}
        labelClose={I18n.t("features.wallet.home.paymentsBanner.close")}
        color="neutral"
        pictogramName="timing"
        size="small"
        viewRef={bannerRef}
        onPress={handleOnBannerPress}
        onClose={handleOnBannerClose}
      />
    </View>
  );
};

export { WalletPaymentsRedirectBanner };

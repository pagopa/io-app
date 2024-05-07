import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { default as React } from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { WALLET_PAYMENT_FEEDBACK_URL } from "../utils";

const WalletPaymentFeebackBanner = () => {
  const bannerViewRef = React.useRef<View>(null);

  const handleBannerPress = () => {
    void mixpanelTrack("VOC_USER_EXIT", {
      screen_name: "PAYMENT_OUTCOMECODE_MESSAGE"
    });

    return openAuthenticationSession(WALLET_PAYMENT_FEEDBACK_URL, "");
  };

  // This banner is temporarily disabled. Remove the next line to re-enable it
  return null;

  return (
    <>
      <VSpacer size={24} />
      <Banner
        color="neutral"
        pictogramName="feedback"
        size="big"
        viewRef={bannerViewRef}
        title={I18n.t("wallet.payment.outcome.SUCCESS.banner.title")}
        content={I18n.t("wallet.payment.outcome.SUCCESS.banner.content")}
        action={I18n.t("wallet.payment.outcome.SUCCESS.banner.action")}
        onPress={handleBannerPress}
      />
    </>
  );
};

export { WalletPaymentFeebackBanner };

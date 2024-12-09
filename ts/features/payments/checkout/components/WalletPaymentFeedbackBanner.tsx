import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { default as React } from "react";
import { View } from "react-native";
import { mixpanelTrack } from "../../../../mixpanel";
import { useIOSelector } from "../../../../store/hooks";
import {
  isPaymentsFeedbackBannerEnabledSelector,
  paymentsFeedbackBannerConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { getFullLocale } from "../../../../utils/locale";

const WalletPaymentFeebackBanner = () => {
  const bannerViewRef = React.useRef<View>(null);
  const isBannerEnabled = useIOSelector(
    isPaymentsFeedbackBannerEnabledSelector
  );
  const feedbackBannerConfig = useIOSelector(
    paymentsFeedbackBannerConfigSelector
  );
  const locale = getFullLocale();

  const handleBannerPress = () => {
    if (!feedbackBannerConfig?.action) {
      return;
    }
    void mixpanelTrack("VOC_USER_EXIT", {
      screen_name: "PAYMENT_OUTCOMECODE_MESSAGE"
    });
    return openAuthenticationSession(feedbackBannerConfig.action.url, "");
  };

  if (!isBannerEnabled || !feedbackBannerConfig) {
    return null;
  }

  return (
    <>
      <VSpacer size={24} />
      <Banner
        color="neutral"
        pictogramName="feedback"
        size="big"
        viewRef={bannerViewRef}
        title={feedbackBannerConfig.title?.[locale]}
        content={feedbackBannerConfig.description[locale]}
        action={feedbackBannerConfig.action?.label[locale]}
        onPress={handleBannerPress}
      />
    </>
  );
};

export { WalletPaymentFeebackBanner };

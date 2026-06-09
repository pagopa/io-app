import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { useRef } from "react";
import { View } from "react-native";
import { mixpanelTrack } from "../../../../mixpanel";
import { useIOSelector } from "../../../../store/hooks";
import {
  isPaymentsFeedbackBannerEnabledSelector,
  paymentsFeedbackBannerConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";

const WalletPaymentFeebackBanner = () => {
  const bannerViewRef = useRef<View>(null);
  const isBannerEnabled = useIOSelector(
    isPaymentsFeedbackBannerEnabledSelector
  );
  const feedbackBannerConfig = useIOSelector(
    paymentsFeedbackBannerConfigSelector
  );
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

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
        ref={bannerViewRef}
        title={feedbackBannerConfig.title?.[localeFallback]}
        content={feedbackBannerConfig.description[localeFallback]}
        // Starting from version 5.1.3 of the Design System, the `action` property,
        // if explicitly configured, cannot have the value `undefined`.
        action={feedbackBannerConfig.action?.label[localeFallback] ?? ""}
        onPress={handleBannerPress}
      />
    </>
  );
};

export { WalletPaymentFeebackBanner };

import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { useIOSelector } from "../../../../store/hooks";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import {
  isPnFeedbackBannerEnabledSelector,
  pnFeedbackBannerConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";

export const SendAArFeedbackBanner = () => {
  const isBannerEnabled = useIOSelector(isPnFeedbackBannerEnabledSelector);
  const feedbackBannerConfig = useIOSelector(pnFeedbackBannerConfigSelector);
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  if (!isBannerEnabled || !feedbackBannerConfig) {
    return null;
  }

  return (
    <>
      <Banner
        color="neutral"
        pictogramName="feedback"
        // content={I18n.t(
        //   "features.pn.aar.flow.closeNotification.surveyBanner.description"
        // )}
        // action={I18n.t(
        //   "features.pn.aar.flow.closeNotification.surveyBanner.action"
        // )}
        title={feedbackBannerConfig.title?.[localeFallback]}
        content={feedbackBannerConfig.description[localeFallback]}
        action={feedbackBannerConfig.action?.label[localeFallback] ?? ""}
        onPress={() => {
          if (!feedbackBannerConfig.action) {
            return;
          }
          return openAuthenticationSession(feedbackBannerConfig.action.url, "");
        }}
      />
      <VSpacer size={24} />
    </>
  );
};

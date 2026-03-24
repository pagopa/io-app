import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import { pnFeedbackBannerConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";

export const SendAArFeedbackBanner = () => {
  const feedbackBannerConfig = useIOSelector(pnFeedbackBannerConfigSelector);
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  if (!feedbackBannerConfig) {
    return null;
  }

  return (
    <>
      <Banner
        color="neutral"
        pictogramName="feedback"
        title={feedbackBannerConfig.title?.[localeFallback]}
        content={feedbackBannerConfig.description[localeFallback]}
        action={feedbackBannerConfig.action?.label[localeFallback] ?? ""}
        onPress={() => {
          if (!feedbackBannerConfig.action) {
            return;
          }
          return openWebUrl(feedbackBannerConfig.action.url);
        }}
      />
      <VSpacer size={24} />
    </>
  );
};

import { Banner, VSpacer } from "@io-app/design-system";

import { useIOSelector } from "../../../../store/hooks";
import {
  isPnFeedbackBannerEnabledSelector,
  pnFeedbackBannerConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import { openWebUrl } from "../../../../utils/url";

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
        action={feedbackBannerConfig.action?.label[localeFallback] ?? ""}
        color="turquoise"
        content={feedbackBannerConfig.description[localeFallback]}
        onPress={() => {
          if (!feedbackBannerConfig.action) {
            return;
          }
          return openWebUrl(feedbackBannerConfig.action.url);
        }}
        pictogramName="feedback"
        title={feedbackBannerConfig.title?.[localeFallback]}
      />
      <VSpacer size={24} />
    </>
  );
};

import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo } from "react";

import { useIOSelector } from "../../../../../../store/hooks";
import { openWebUrl } from "../../../../../../utils/url";
import { tosConfigSelector } from "../../../../../tos/store/selectors";
import { TrackingInfo } from "../../../../common/analytics/mixpanel/mixpanelAnalytics";
import {
  AnalyticsFeatureInfo,
  FeatureProps,
  GDPRFeatureInfo,
  SecurityFeatureInfo
} from "./ShareDataFeatureInfos";

export const ShareDataComponent = memo(({ trackAction }: FeatureProps) => {
  const tosConfig = useIOSelector(tosConfigSelector);
  const privacyUrl = tosConfig.tos_url;

  const handleOnPress = () => {
    trackAction(TrackingInfo.TOS);
    openWebUrl(privacyUrl);
  };

  return (
    <>
      <VSpacer size={16} />
      <AnalyticsFeatureInfo trackAction={trackAction} />
      <VSpacer size={24} />
      <SecurityFeatureInfo trackAction={trackAction} />
      <VSpacer size={24} />
      <GDPRFeatureInfo trackAction={trackAction} />
      <VSpacer size={32} />
      <Body
        accessibilityLabel={`${I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}${I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.cta"
        )}`}
        accessibilityRole="link"
      >
        {I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}
        <Body
          asLink
          avoidPressable
          onPress={handleOnPress}
          testID="additionalInformation"
          weight="Semibold"
        >
          {I18n.t(
            "profile.main.privacy.shareData.screen.additionalInformation.cta"
          )}
        </Body>
      </Body>
    </>
  );
});

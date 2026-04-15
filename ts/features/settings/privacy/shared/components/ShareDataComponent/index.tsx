import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { memo } from "react";
import I18n from "i18next";
import { tosConfigSelector } from "../../../../../tos/store/selectors";
import { useIOSelector } from "../../../../../../store/hooks";
import { openWebUrl } from "../../../../../../utils/url";
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
        accessibilityRole="link"
        accessibilityLabel={`${I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}${I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.cta"
        )}`}
      >
        {I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}
        <Body
          weight="Semibold"
          asLink
          avoidPressable
          onPress={handleOnPress}
          testID="additionalInformation"
        >
          {I18n.t(
            "profile.main.privacy.shareData.screen.additionalInformation.cta"
          )}
        </Body>
      </Body>
    </>
  );
});

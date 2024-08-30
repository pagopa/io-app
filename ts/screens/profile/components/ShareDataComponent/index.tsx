import { VSpacer } from "@pagopa/io-app-design-system";
import React, { memo } from "react";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";
import { TrackingInfo } from "../../analytics/mixpanel/mixpanelAnalytics";
import { useIOSelector } from "../../../../store/hooks";
import { tosConfigSelector } from "../../../../features/tos/store/selectors";
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
        <Link onPress={handleOnPress} testID="additionalInformation">
          {I18n.t(
            "profile.main.privacy.shareData.screen.additionalInformation.cta"
          )}
        </Link>
      </Body>
    </>
  );
});

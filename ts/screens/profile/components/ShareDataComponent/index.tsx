import { VSpacer } from "@pagopa/io-app-design-system";
import React, { memo } from "react";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import { privacyUrl } from "../../../../config";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";
import {
  AnalyticsFeatureInfo,
  GDPRFeatureInfo,
  SecurityFeatureInfo
} from "./ShareDataFeatureInfos";

export const ShareDataComponent = memo(() => {
  const handleOnPress = () => {
    openWebUrl(privacyUrl);
  };

  return (
    <>
      <VSpacer size={16} />
      <AnalyticsFeatureInfo />
      <VSpacer size={24} />
      <SecurityFeatureInfo />
      <VSpacer size={24} />
      <GDPRFeatureInfo />
      <VSpacer size={32} />
      <Body
        accessibilityRole="link"
        onPress={handleOnPress}
        testID="additionalInformation"
      >
        {I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}
        <Link>
          {I18n.t(
            "profile.main.privacy.shareData.screen.additionalInformation.cta"
          )}
        </Link>
      </Body>
    </>
  );
});

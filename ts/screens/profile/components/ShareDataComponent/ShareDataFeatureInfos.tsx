import {
  Label,
  Body,
  FeatureInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useCallback, useMemo } from "react";
import I18n from "../../../../i18n";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { ioSuppliersUrl } from "../../../../urls";
import { TrackingInfo } from "../../analytics/mixpanel/mixpanelAnalytics";

export type FeatureProps = {
  trackAction: (info: TrackingInfo) => void;
};

const shareDataSecurityMoreLink =
  "https://www.pagopa.it/it/politiche-sulla-sicurezza-delle-informazioni-e-sulla-qualita/";

const MarkdownBody = () => (
  <>
    <VSpacer size={16} />
    <LegacyMarkdown avoidTextSelection>
      {I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
    </LegacyMarkdown>
  </>
);

const AnalyticsFeatureInfo = ({ trackAction }: FeatureProps) => {
  const { present, bottomSheet } = useLegacyIOBottomSheetModal(
    <MarkdownBody />,
    I18n.t("profile.main.privacy.shareData.whyBottomSheet.title"),
    350
  );

  const analyticsBody = useMemo(
    () => (
      <Body>
        {I18n.t("profile.main.privacy.shareData.screen.why.description.one")}
        <Label color="info-850">
          {I18n.t("profile.main.privacy.shareData.screen.why.description.two")}
        </Label>
        {`${I18n.t(
          "profile.main.privacy.shareData.screen.why.description.three"
        )}`}
      </Body>
    ),
    []
  );

  const handleOnPress = useCallback(() => {
    trackAction(TrackingInfo.WHY);
    present();
  }, [trackAction, present]);

  return (
    <>
      <FeatureInfo
        iconName="analytics"
        actionLabel={I18n.t("profile.main.privacy.shareData.screen.why.cta")}
        actionOnPress={handleOnPress}
        body={analyticsBody}
      />
      {bottomSheet}
    </>
  );
};

const SecurityFeatureInfo = ({ trackAction }: FeatureProps) => {
  const handleOnPress = () => {
    trackAction(TrackingInfo.FIND_OUT_MORE);
    openWebUrl(shareDataSecurityMoreLink);
  };

  return (
    <FeatureInfo
      iconName="locked"
      actionLabel={I18n.t("profile.main.privacy.shareData.screen.security.cta")}
      actionOnPress={handleOnPress}
      body={
        <Body>
          {I18n.t(
            "profile.main.privacy.shareData.screen.security.description.one"
          )}
          <Label color="info-850">
            {I18n.t(
              "profile.main.privacy.shareData.screen.security.description.two"
            )}
          </Label>
          {I18n.t(
            "profile.main.privacy.shareData.screen.security.description.three"
          )}
        </Body>
      }
    />
  );
};

const GDPRFeatureInfo = ({ trackAction }: FeatureProps) => {
  const handleOnPress = () => {
    trackAction(TrackingInfo.SUPPLIERS);
    openWebUrl(ioSuppliersUrl);
  };

  return (
    <FeatureInfo
      iconName="security"
      actionLabel={I18n.t("profile.main.privacy.shareData.screen.gdpr.cta")}
      actionOnPress={handleOnPress}
      body={
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.description.one")}
          <Label color="info-850">
            {I18n.t(
              "profile.main.privacy.shareData.screen.gdpr.description.two"
            )}
          </Label>
        </Body>
      }
    />
  );
};

export { AnalyticsFeatureInfo, SecurityFeatureInfo, GDPRFeatureInfo };

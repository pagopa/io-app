import {
  Label,
  Body,
  FeatureInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import I18n from "../../../../i18n";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { ioSuppliersUrl } from "../../../../urls";

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

const AnalyticsFeatureInfo = () => {
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

  return (
    <>
      <FeatureInfo
        iconName="analytics"
        actionLabel={I18n.t("profile.main.privacy.shareData.screen.why.cta")}
        actionOnPress={present}
        body={analyticsBody}
      />
      {bottomSheet}
    </>
  );
};

const SecurityFeatureInfo = () => {
  const handleOnPress = () => {
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

const GDPRFeatureInfo = () => {
  const handleOnPress = () => {
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

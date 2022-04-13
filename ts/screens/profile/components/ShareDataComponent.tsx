import { View } from "native-base";
import * as React from "react";
import { InfoBox } from "../../../components/box/InfoBox";
import { Body } from "../../../components/core/typography/Body";
import { H1 } from "../../../components/core/typography/H1";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import Markdown from "../../../components/ui/Markdown";
import { privacyUrl } from "../../../config";
import I18n from "../../../i18n";
import { ioSuppliersUrl } from "../../../urls";
import { useIOBottomSheet } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";

type MarkdownProps = {
  body: string;
};

const MarkdownBody = (props: MarkdownProps): React.ReactElement => (
  <>
    <View spacer={true} />
    <Markdown avoidTextSelection={true}>{props.body}</Markdown>
  </>
);

const shareDataSecurityMoreLink =
  "https://www.pagopa.it/static/781646994f1f8ddad2d95af3aaedac3d/Sicurezza-delle-informazioni_PagoPA-S.p.A..pdf";
export const ShareDataComponent = (): React.ReactElement => {
  const { present, bottomSheet } = useIOBottomSheet(
    <MarkdownBody
      body={I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
    />,
    I18n.t("profile.main.privacy.shareData.whyBottomSheet.title"),
    350
  );

  return (
    <>
      <H1>{I18n.t("profile.main.privacy.shareData.screen.title")}</H1>
      <View spacer={true} />
      <Body>{I18n.t("profile.main.privacy.shareData.screen.description")}</Body>
      <View spacer={true} />
      <InfoBox iconName={"io-analytics"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.why.description.one")}
          <Label color={"bluegrey"}>
            {I18n.t(
              "profile.main.privacy.shareData.screen.why.description.two"
            )}
          </Label>
          {`${I18n.t(
            "profile.main.privacy.shareData.screen.why.description.three"
          )} `}
          <Link onPress={present} testID="why">
            {I18n.t("profile.main.privacy.shareData.screen.why.cta")}
          </Link>
        </Body>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"io-eye-off"}>
        <Body>
          {`${I18n.t(
            "profile.main.privacy.shareData.screen.security.description.one"
          )} `}
          <Link
            onPress={() => openWebUrl(shareDataSecurityMoreLink)}
            testID="security"
          >
            {I18n.t("profile.main.privacy.shareData.screen.security.cta")}
          </Link>
        </Body>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"io-fornitori"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.description.one")}
          <Label color={"bluegrey"}>
            {`${I18n.t(
              "profile.main.privacy.shareData.screen.gdpr.description.two"
            )} `}
          </Label>
          <Link onPress={() => openWebUrl(ioSuppliersUrl)} testID="gdpr">
            {I18n.t("profile.main.privacy.shareData.screen.gdpr.cta")}
          </Link>
        </Body>
      </InfoBox>
      <View spacer={true} />
      <Body
        accessibilityRole="link"
        onPress={() => openWebUrl(privacyUrl)}
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
      {bottomSheet}
    </>
  );
};

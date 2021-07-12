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
import { useIOBottomSheet } from "../../../utils/bottomSheet";
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

export const ShareDataComponent = (): React.ReactElement => {
  const whyBottomSheet = useIOBottomSheet(
    <MarkdownBody
      body={I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
    />,
    I18n.t("profile.main.privacy.shareData.whyBottomSheet.title"),
    350
  );
  const securityBottomSheet = useIOBottomSheet(
    <MarkdownBody
      body={I18n.t("profile.main.privacy.shareData.securityBottomSheet.body")}
    />,
    I18n.t("profile.main.privacy.shareData.securityBottomSheet.title"),
    400
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
          {I18n.t(
            "profile.main.privacy.shareData.screen.why.description.three"
          )}
        </Body>
        <Link onPress={whyBottomSheet.present} testID="why">
          {I18n.t("profile.main.privacy.shareData.screen.why.cta")}
        </Link>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"io-eye-off"}>
        <Body>
          {I18n.t(
            "profile.main.privacy.shareData.screen.security.description.one"
          )}
          <Label color={"bluegrey"}>
            {I18n.t(
              "profile.main.privacy.shareData.screen.security.description.two"
            )}
          </Label>
        </Body>
        <Link onPress={securityBottomSheet.present} testID="security">
          {I18n.t("profile.main.privacy.shareData.screen.security.cta")}
        </Link>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"io-fornitori"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.description.one")}
          <Label color={"bluegrey"}>
            {I18n.t(
              "profile.main.privacy.shareData.screen.gdpr.description.two"
            )}
          </Label>
        </Body>
        <Link onPress={() => openWebUrl(ioSuppliersUrl)} testID="gdpr">
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.cta")}
        </Link>
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
    </>
  );
};

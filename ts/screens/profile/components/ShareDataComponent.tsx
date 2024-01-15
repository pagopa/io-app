import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { InfoBox } from "../../../components/box/InfoBox";
import { Body } from "../../../components/core/typography/Body";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import Markdown from "../../../components/ui/Markdown";
import { privacyUrl } from "../../../config";
import I18n from "../../../i18n";
import { ioSuppliersUrl } from "../../../urls";
import { useLegacyIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";

type MarkdownProps = {
  body: string;
};

const MarkdownBody = (props: MarkdownProps): React.ReactElement => (
  <>
    <VSpacer size={16} />
    <Markdown avoidTextSelection={true}>{props.body}</Markdown>
  </>
);

const shareDataSecurityMoreLink =
  "https://www.pagopa.it/it/politiche-per-la-sicurezza-delle-informazioni";
export const ShareDataComponent = (): React.ReactElement => {
  const { present, bottomSheet } = useLegacyIOBottomSheetModal(
    <MarkdownBody
      body={I18n.t("profile.main.privacy.shareData.whyBottomSheet.body")}
    />,
    I18n.t("profile.main.privacy.shareData.whyBottomSheet.title"),
    350
  );

  return (
    <>
      <VSpacer size={16} />
      <InfoBox iconName="analytics">
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
      <VSpacer size={16} />
      <InfoBox iconName="eyeHide">
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
      <VSpacer size={16} />
      <InfoBox iconName="fornitori">
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
      <VSpacer size={16} />
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

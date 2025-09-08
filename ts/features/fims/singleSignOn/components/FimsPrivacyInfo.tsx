import { Body } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";
import { openWebUrl } from "../../../../utils/url";

export const FimsPrivacyInfo = ({ privacyUrl }: PrivacyInfoProps) =>
  privacyUrl !== undefined ? (
    <Body>
      {I18n.t("FIMS.consentsScreen.privacy1")}
      <Body
        weight="Semibold"
        asLink
        onPress={() => openWebUrl(privacyUrl)}
        testID="body-primary-action"
      >
        {I18n.t("FIMS.consentsScreen.privacyCta")}
      </Body>
    </Body>
  ) : (
    <LoadingSkeleton lines={2} testID="skeleton" />
  );

type PrivacyInfoProps = { privacyUrl?: string };

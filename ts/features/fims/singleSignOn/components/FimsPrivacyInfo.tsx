import { IOMarkdownLite } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";
import { openWebUrl } from "../../../../utils/url";

export const FimsPrivacyInfo = ({ privacyUrl }: PrivacyInfoProps) =>
  privacyUrl !== undefined ? (
    <IOMarkdownLite
      content={I18n.t("FIMS.consentsScreen.privacy", { privacyUrl })}
      onLinkPress={openWebUrl}
    />
  ) : (
    <LoadingSkeleton lines={2} testID="skeleton" />
  );

type PrivacyInfoProps = { privacyUrl?: string };

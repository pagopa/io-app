import { Label } from "@pagopa/io-app-design-system";
import * as React from "react";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

export const FimsPrivacyInfo = ({ privacyUrl }: PrivacyInfoProps) =>
  privacyUrl !== undefined ? (
    <Label weight="Regular">
      {I18n.t("FIMS.consentsScreen.privacy1")}
      <Label asLink onPress={() => openWebUrl(privacyUrl)}>
        {I18n.t("FIMS.consentsScreen.privacyCta")}
      </Label>
    </Label>
  ) : (
    <LoadingSkeleton lines={2} />
  );

type PrivacyInfoProps = { privacyUrl?: string };

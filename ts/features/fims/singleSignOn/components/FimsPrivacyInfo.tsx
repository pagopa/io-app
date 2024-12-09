import { Body } from "@pagopa/io-app-design-system";
import * as React from "react";
import { LoadingSkeleton } from "../../../../components/ui/Markdown/LoadingSkeleton";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

export const FimsPrivacyInfo = ({ privacyUrl }: PrivacyInfoProps) =>
  privacyUrl !== undefined ? (
    <Body>
      {I18n.t("FIMS.consentsScreen.privacy1")}
      <Body weight="Semibold" asLink onPress={() => openWebUrl(privacyUrl)}>
        {I18n.t("FIMS.consentsScreen.privacyCta")}
      </Body>
    </Body>
  ) : (
    <LoadingSkeleton lines={2} />
  );

type PrivacyInfoProps = { privacyUrl?: string };

import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import LegacyMarkdown from "../../components/ui/Markdown/LegacyMarkdown";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";

const ProfileAboutApp = () => (
  <RNavScreenWithLargeHeader
    title={{
      label: I18n.t("profile.main.appInfo.title")
    }}
    headerActionsProp={{ showHelp: false }}
  >
    <ContentWrapper>
      <VSpacer size={8} />
      <LegacyMarkdown>
        {I18n.t("profile.main.appInfo.contextualHelpContent")}
      </LegacyMarkdown>
      <VSpacer size={24} />
    </ContentWrapper>
  </RNavScreenWithLargeHeader>
);

export default ProfileAboutApp;

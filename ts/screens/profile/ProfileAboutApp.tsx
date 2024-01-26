import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import Markdown from "../../components/ui/Markdown";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";

const ProfileAboutApp = () => (
  <RNavScreenWithLargeHeader
    title={I18n.t("profile.main.appInfo.title")}
    headerActionsProp={{ showHelp: false }}
  >
    <ContentWrapper>
      <VSpacer size={8} />
      <Markdown>
        {I18n.t("profile.main.appInfo.contextualHelpContent")}
      </Markdown>
      <VSpacer size={24} />
    </ContentWrapper>
  </RNavScreenWithLargeHeader>
);

export default ProfileAboutApp;

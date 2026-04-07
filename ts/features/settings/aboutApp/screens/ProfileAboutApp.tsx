import {
  Banner,
  ContentWrapper,
  H4,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { absolutePortalLinksSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";

const ProfileAboutApp = () => {
  const absolutePortalLinks = useIOSelector(absolutePortalLinksSelector);

  const onNavigateToIOSite = useCallback(
    () => openWebUrl(absolutePortalLinks.io_showcase),
    [absolutePortalLinks.io_showcase]
  );

  return (
    <IOScrollViewWithLargeHeader
      description={I18n.t("profile.main.appInfo.subtitle")}
      headerActionsProp={{ showHelp: false }}
      title={{
        label: I18n.t("profile.main.appInfo.title")
      }}
    >
      <ContentWrapper>
        <VSpacer size={16} />
        <H4>{I18n.t("profile.main.appInfo.paragraphTitle")}</H4>
        <VSpacer size={16} />
        <IOMarkdownLite
          content={I18n.t("profile.main.appInfo.paragraphBody")}
        />
        <VSpacer size={32} />
        <Banner
          action={I18n.t("profile.main.appInfo.bannerButton")}
          color="neutral"
          content={I18n.t("profile.main.appInfo.bannerBody")}
          onPress={onNavigateToIOSite}
          pictogramName="charity"
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default ProfileAboutApp;

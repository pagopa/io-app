import {
  Banner,
  BodyProps,
  ComposedBodyFromArray,
  ContentWrapper,
  H4,
  VSpacer
} from "@pagopa/io-app-design-system";
import { createRef, useCallback, useMemo } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { openWebUrl } from "../../../../utils/url";
import { useIOSelector } from "../../../../store/hooks";
import { absolutePortalLinksSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

const ProfileAboutApp = () => {
  const viewRef = createRef<View>();
  const absolutePortalLinks = useIOSelector(absolutePortalLinksSelector);

  const onNavigateToIOSite = useCallback(
    () => openWebUrl(absolutePortalLinks.io_showcase),
    [absolutePortalLinks.io_showcase]
  );

  const bodyPropsArray = useMemo(
    () =>
      [
        {
          key: "key1",
          text: I18n.t("profile.main.appInfo.paragraphBody1"),
          weight: "Semibold"
        },
        {
          key: "key2",
          text: I18n.t("profile.main.appInfo.paragraphBody2"),
          weight: "Regular"
        }
      ] as Array<BodyProps>,
    []
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.appInfo.title")
      }}
      description={I18n.t("profile.main.appInfo.subtitle")}
      headerActionsProp={{ showHelp: false }}
    >
      <ContentWrapper>
        <VSpacer size={16} />
        <H4>{I18n.t("profile.main.appInfo.paragraphTitle")}</H4>
        <VSpacer size={16} />
        <ComposedBodyFromArray body={bodyPropsArray} textAlign="left" />
        <VSpacer size={32} />
        <Banner
          ref={viewRef}
          color="neutral"
          content={I18n.t("profile.main.appInfo.bannerBody")}
          pictogramName="charity"
          onPress={onNavigateToIOSite}
          action={I18n.t("profile.main.appInfo.bannerButton")}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default ProfileAboutApp;

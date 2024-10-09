import {
  Alert,
  Banner,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useCallback } from "react";
import { setShowProfileBanner } from "../../features/profileSettings/store/actions";
import { profileBannerToShowSelector } from "../../features/profileSettings/store/selectors";
import { openSystemNotificationSettingsScreen } from "../../features/pushNotifications/utils";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../store/hooks";

export const ProfileMainScreenTopBanner = () => {
  const bannerToShow = useIOSelector(profileBannerToShowSelector);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const handleCloseBanner = useCallback(() => {
    dispatch(setShowProfileBanner(false));
  }, [dispatch]);

  const navigateToProfile = useCallback(
    () =>
      navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.PROFILE_DATA
      }),
    [navigation]
  );

  switch (bannerToShow) {
    case "NOTIFICATIONS":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Alert
            content={I18n.t("notifications.profileBanner.title")}
            action={I18n.t("notifications.profileBanner.cta")}
            onPress={openSystemNotificationSettingsScreen}
            variant="error"
            testID="notifications-banner"
          />
        </ContentWrapper>
      );
    case "PROFILE_BANNER":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Banner
            title={I18n.t("profile.main.banner.title")}
            action={I18n.t("profile.main.banner.action")}
            pictogramName={"help"}
            color={"neutral"}
            size={"big"}
            onPress={navigateToProfile}
            onClose={handleCloseBanner}
            labelClose={I18n.t("profile.main.banner.close")}
            testID={"fiscal-code-banner"}
          />
        </ContentWrapper>
      );
    default:
      return <></>;
  }
};

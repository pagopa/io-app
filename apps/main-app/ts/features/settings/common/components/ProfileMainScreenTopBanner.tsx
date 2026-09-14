import { Alert, Banner, ContentWrapper, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setShowAppearanceSettingsBanner } from "../../../appearanceSettings/store/actions";
import { settingsBannerToShowSelector } from "../../../appearanceSettings/store/selectors";
import {
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized
} from "../../../pushNotifications/analytics";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import { SETTINGS_ROUTES } from "../navigation/routes";

export const ProfileMainScreenTopBanner = () => {
  const bannerToShow = useIOSelector(settingsBannerToShowSelector);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const handleCloseBanner = useCallback(() => {
    dispatch(setShowAppearanceSettingsBanner(false));
  }, [dispatch]);

  const navigateToAppearance = useCallback(
    () =>
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_APPEARANCE
      }),
    [navigation]
  );

  const onPressNotifications = useCallback(() => {
    trackPushNotificationsBannerTap(SETTINGS_ROUTES.SETTINGS_MAIN);
    openSystemNotificationSettingsScreen();
  }, []);

  useEffect(() => {
    if (bannerToShow === "NOTIFICATIONS") {
      trackPushNotificationsBannerVisualized(SETTINGS_ROUTES.SETTINGS_MAIN);
    }
  }, [bannerToShow]);

  switch (bannerToShow) {
    case "APPEARANCE_SETTINGS_BANNER":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Banner
            action={I18n.t("profile.main.appearanceBanner.action")}
            color={"neutral"}
            labelClose={I18n.t("profile.main.banner.close")}
            onClose={handleCloseBanner}
            onPress={navigateToAppearance}
            pictogramName={"help"}
            testID={"appearance-settings-banner"}
            title={I18n.t("profile.main.appearanceBanner.title")}
          />
        </ContentWrapper>
      );
    case "NOTIFICATIONS":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Alert
            action={I18n.t("notifications.profileBanner.cta")}
            content={I18n.t("notifications.profileBanner.title")}
            onPress={onPressNotifications}
            testID="notifications-banner"
            variant="error"
          />
        </ContentWrapper>
      );
    default:
      return <></>;
  }
};

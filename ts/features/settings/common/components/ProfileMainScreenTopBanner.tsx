import {
  Alert,
  Banner,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import I18n from "i18next";
import { setShowAppearanceSettingsBanner } from "../../../appearanceSettings/store/actions";
import { settingsBannerToShowSelector } from "../../../appearanceSettings/store/selectors";
import {
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized
} from "../../../pushNotifications/analytics";
import { openSystemNotificationSettingsScreen } from "../../../pushNotifications/utils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
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
    case "NOTIFICATIONS":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Alert
            content={I18n.t("notifications.profileBanner.title")}
            action={I18n.t("notifications.profileBanner.cta")}
            onPress={onPressNotifications}
            variant="error"
            testID="notifications-banner"
          />
        </ContentWrapper>
      );
    case "APPEARANCE_SETTINGS_BANNER":
      return (
        <ContentWrapper>
          <VSpacer size={16} />
          <Banner
            title={I18n.t("profile.main.appearanceBanner.title")}
            action={I18n.t("profile.main.appearanceBanner.action")}
            pictogramName={"help"}
            color={"neutral"}
            onPress={navigateToAppearance}
            onClose={handleCloseBanner}
            labelClose={I18n.t("profile.main.banner.close")}
            testID={"appearance-settings-banner"}
          />
        </ContentWrapper>
      );
    default:
      return <></>;
  }
};

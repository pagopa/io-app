import {
  Alert,
  Banner,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { setShowAppearanceSettingsBanner } from "../../features/appearanceSettings/store/actions";
import { settingsBannerToShowSelector } from "../../features/appearanceSettings/store/selectors";
import {
  trackPushNotificationsBannerTap,
  trackPushNotificationsBannerVisualized
} from "../../features/pushNotifications/analytics";
import { openSystemNotificationSettingsScreen } from "../../features/pushNotifications/utils";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../store/hooks";

export const ProfileMainScreenTopBanner = () => {
  const bannerToShow = useIOSelector(settingsBannerToShowSelector);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const handleCloseBanner = useCallback(() => {
    dispatch(setShowAppearanceSettingsBanner(false));
  }, [dispatch]);

  const navigateToAppearance = useCallback(
    () =>
      navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.PROFILE_PREFERENCES_APPEARANCE
      }),
    [navigation]
  );

  const onPressNotifications = useCallback(() => {
    trackPushNotificationsBannerTap(ROUTES.SETTINGS_MAIN);
    openSystemNotificationSettingsScreen();
  }, []);

  useEffect(() => {
    if (bannerToShow === "NOTIFICATIONS") {
      trackPushNotificationsBannerVisualized(ROUTES.SETTINGS_MAIN);
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
            size={"big"}
            onPress={navigateToAppearance}
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

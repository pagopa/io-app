import { GlobalState } from "../../../../store/reducers/types";
import { areNotificationPermissionsEnabled } from "../../../pushNotifications/store/reducers/environment";

export const showProfileBannerSelector = (state: GlobalState) =>
  state.features.profileSettings.showProfileBanner;

export const profileBannerToShowSelector = (state: GlobalState) => {
  const isProfileBannerEnabled = showProfileBannerSelector(state);
  const notificationsEnabled = areNotificationPermissionsEnabled(state);

  return !notificationsEnabled
    ? "NOTIFICATIONS"
    : isProfileBannerEnabled
    ? "PROFILE_BANNER"
    : undefined;
};

export const hasUserAcknowledgedSettingsBannerSelector = (state: GlobalState) =>
  state.features.profileSettings.hasUserAcknowledgedSettingsBanner;

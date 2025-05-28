import { GlobalState } from "../../../../store/reducers/types";
import { areNotificationPermissionsEnabled } from "../../../pushNotifications/store/reducers/environment";

export const showAppearanceSettingsBannerSelector = (state: GlobalState) =>
  state.features.appearanceSettings.showAppearanceBanner;

export const settingsBannerToShowSelector = (state: GlobalState) => {
  const notificationsEnabled = areNotificationPermissionsEnabled(state);

  if (!notificationsEnabled) {
    return "NOTIFICATIONS";
  }

  const isApperanceSettingsBannerEnabled =
    showAppearanceSettingsBannerSelector(state);

  return isApperanceSettingsBannerEnabled
    ? "APPEARANCE_SETTINGS_BANNER"
    : undefined;
};

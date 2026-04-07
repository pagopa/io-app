import {
  Banner,
  Divider,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";

import { usePreviewMoreInfo } from "../hooks/usePreviewMoreInfo";
import { NotificationsPreferencesPreview } from "./NotificationsPreferencesPreview";

type ProfileNotificationSettingsProps = {
  disablePreviewSetting: boolean;
  disableRemindersSetting: boolean;
  isUpdatingPreviewSetting: boolean;
  isUpdatingRemindersSetting: boolean;
  onPreviewValueChanged?: (value: boolean) => void;
  onReminderValueChanged?: (value: boolean) => void;
  previewSwitchValue: boolean;
  remindersSwitchValue: boolean;
  showSettingsPath: boolean;
};

export const ProfileNotificationSettings = ({
  disablePreviewSetting,
  disableRemindersSetting,
  isUpdatingPreviewSetting,
  isUpdatingRemindersSetting,
  onPreviewValueChanged,
  onReminderValueChanged,
  previewSwitchValue,
  remindersSwitchValue,
  showSettingsPath
}: ProfileNotificationSettingsProps) => {
  const { present, bottomSheet } = usePreviewMoreInfo();
  return (
    <>
      <VSpacer size={24} />
      <NotificationsPreferencesPreview
        previewEnabled={previewSwitchValue}
        remindersEnabled={remindersSwitchValue}
      />
      <VSpacer size={24} />
      <ListItemSwitch
        action={{
          label: I18n.t("profile.preferences.notifications.preview.link"),
          onPress: present
        }}
        description={I18n.t(
          "profile.preferences.notifications.preview.description"
        )}
        disabled={disablePreviewSetting}
        isLoading={isUpdatingPreviewSetting}
        label={I18n.t("profile.preferences.notifications.preview.title")}
        onSwitchValueChange={onPreviewValueChanged}
        switchTestID={"previewsPreferenceSwitch"}
        value={previewSwitchValue}
      />
      <Divider />
      <ListItemSwitch
        description={I18n.t(
          "profile.preferences.notifications.reminders.description"
        )}
        disabled={disableRemindersSetting}
        isLoading={isUpdatingRemindersSetting}
        label={I18n.t("profile.preferences.notifications.reminders.title")}
        onSwitchValueChange={onReminderValueChanged}
        switchTestID={"remindersPreferenceSwitch"}
        value={remindersSwitchValue}
      />
      {showSettingsPath && <VSpacer size={40} />}
      {showSettingsPath && (
        <Banner
          color="neutral"
          content={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          pictogramName="settings"
        />
      )}
      <VSpacer size={32} />
      {bottomSheet}
    </>
  );
};

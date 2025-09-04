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
        label={I18n.t("profile.preferences.notifications.preview.title")}
        description={I18n.t(
          "profile.preferences.notifications.preview.description"
        )}
        action={{
          label: I18n.t("profile.preferences.notifications.preview.link"),
          onPress: present
        }}
        value={previewSwitchValue}
        disabled={disablePreviewSetting}
        isLoading={isUpdatingPreviewSetting}
        onSwitchValueChange={onPreviewValueChanged}
        switchTestID={"previewsPreferenceSwitch"}
      />
      <Divider />
      <ListItemSwitch
        label={I18n.t("profile.preferences.notifications.reminders.title")}
        description={I18n.t(
          "profile.preferences.notifications.reminders.description"
        )}
        value={remindersSwitchValue}
        disabled={disableRemindersSetting}
        isLoading={isUpdatingRemindersSetting}
        onSwitchValueChange={onReminderValueChanged}
        switchTestID={"remindersPreferenceSwitch"}
      />
      {showSettingsPath && <VSpacer size={40} />}
      {showSettingsPath && (
        <Banner
          pictogramName="settings"
          content={I18n.t(
            "profile.main.privacy.shareData.screen.profileSettings"
          )}
          color="neutral"
        />
      )}
      <VSpacer size={32} />
      {bottomSheet}
    </>
  );
};
